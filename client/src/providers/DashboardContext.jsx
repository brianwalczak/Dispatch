import { api_url, socket_url } from "../providers/config";
// ------------------------------------------------------- //
import { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import { io } from "socket.io-client";
const DashboardContext = createContext(undefined);

const DEFAULT_PAGE = "home";

export const DashboardProvider = () => {
    const { page: urlPage } = useParams();

    const [page, setPage] = useState(urlPage || DEFAULT_PAGE);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [token] = useState(localStorage.getItem("token"));
    const [socket, setSocket] = useState(null);
    const [members, setMembers] = useState([]); // array of connected agents

    // modals / toasts
    const [showInvite, setShowInvite] = useState(false);
    const [showPending, setShowPending] = useState(false);
    const [toast, setToast] = useState(null);

    // Fetch data for the user using the token (use ajax)
    const fetchUser = useCallback(() => {
        if (!token) return;

        $.ajax({
            url: (api_url + "/api/user/me"),
            method: "POST",
            data: { token: token, workspace: (localStorage.getItem("workspace") || null) },
            success: function (response) {
                if (response.success && response.data) {
                    let workspace = localStorage.getItem("workspace");

                    if ((!workspace || !response.data.teams.some(t => t.id === workspace)) && response.data.lastOpenedId) {
                        workspace = response.data.lastOpenedId;
                        localStorage.setItem("workspace", response.data.lastOpenedId);
                    }

                    response.data.team = response.data.teams.find(t => t.id === workspace) || null;
                    if (!response.data.team) {
                        if (localStorage.getItem("workspace") !== null) {
                            localStorage.removeItem("workspace"); // might be stale
                            return window.location.reload();
                        } else if (page !== "create_workspace") {
                            return switchPage("create_workspace");
                        }
                    }

                    setUser(response.data);
                }
            },
            error: function (xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/auth/sign_in";
                } else {
                    setToast({ id: "err-toast", type: "error", message: "An internal error occurred. Please try again later.", onClose: () => setToast(null) });
                }
            }
        });
    }, [page, token]);

    const switchPage = useCallback((newPage) => {
        if (newPage === page) return;

        setLoading(true);
        return setPage(newPage);
    }, [page]);

    const useHistory = useRef(false); // annoying quirk but we can't have the pushState adding the page if it's already in history and we're just moving back/forward
    useEffect(() => {
        const woopopchange = () => {
            const location = window.location.pathname?.replace("/", "");

            if (location && location !== page) {
                useHistory.current = true; // signal we're using history to avoid pushState
                switchPage(location);
            }
        };

        window.addEventListener('popstate', woopopchange);
        
        return () => {
            window.removeEventListener('popstate', woopopchange);
        };
    }, [page]);

    useEffect(() => {
        if (!useHistory.current) {
            window.history.pushState({}, "", `/${page}`); // brand new, push to history
        }

        useHistory.current = false; // reset flag
        fetchUser(); // fetch user data again (in-case something changed)
    }, [page]); // when user changes page, fetch new data (also on mount)

    // Establish socket connection when user is available
    useEffect(() => {
        if (user && user.team && !socket) {
            const newSocket = io(socket_url, { auth: { type: "agent", token: token, teamId: user.team.id } });
            setSocket(newSocket);

            newSocket.on("members", (members) => {
                setMembers(members);
            });

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user, token]);

    // Redirect to sign in if token is ever not available
    useEffect(() => {
        if (!token) {
            window.location.href = "/auth/sign_in";
        }
    }, [token]);

    return (
        <DashboardContext.Provider value={{ page, switchPage, loading, setLoading, user, setUser, token, socket, members, showInvite, setShowInvite, showPending, setShowPending, toast, setToast }}>
            <Dashboard />
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const ctx = useContext(DashboardContext);
    if (!ctx) throw new Error("useDashboard should be used within a DashboardContext!!!!");

    return ctx;
};
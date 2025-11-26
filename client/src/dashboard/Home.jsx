import { api_url } from "../providers/config";
// ------------------------------------------------------- //
import { useState, useEffect } from "react";
import InviteModal from "../components/InviteModal";

function Home({ user, onLoad, setToast }) {
    const [loading, setLoading] = useState(true);
    const [token] = useState(localStorage.getItem("token"));
    const [stats, setStats] = useState({ open: 0, closed: 0, total: 0 });
    const [sessions, setSessions] = useState([]);
    const [users, setUsers] = useState([]);

    function getInitials(name) {
        return name
            .split(" ")           // split into words
            .slice(0, 2)          // take up to the first 2 words for profile pictures
            .map(word => word[0]) // take first letter of each
            .join("")             // join letters together
            .toUpperCase();
    }

    useEffect(() => {
        // Fetch sessions data
        $.ajax({
            url: (api_url + `/api/sessions/${user.team.id}`),
            method: 'POST',
            data: { token: token },
            success: function (response) {
                if (response.success && response.data) {
                    const recents = response.data.slice(0, 5); // first 5 sessions (alr sorted newest by backend)

                    setStats({
                        open: response.data.filter(s => s.status === 'open').length, // get count of open sessions
                        closed: response.data.filter(s => s.status === 'closed').length, // get count of closed sessions
                        total: response.data.length, // get count of total sessions
                    });

                    setSessions(recents);
                }
            },
            error: function (xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/auth/sign_in";
                } else {
                    setToast({ id: "err-toast", type: "error", message: "An internal error occurred. Please try again later.", onClose: () => setToast(null) });
                }
            },
        });

        // Fetch team members data
        $.ajax({
            url: (api_url + `/api/workspaces/${user.team.id}`),
            method: 'POST',
            data: { token: token },
            success: function (response) {
                if (response.success && response.data) {
                    let fetchedUsers = response.data.users || [];

                    // Ensure you're always at the top
                    fetchedUsers = [
                        ...fetchedUsers.filter(u => u.id === user.id),
                        ...fetchedUsers.filter(u => u.id !== user.id)
                    ];

                    setUsers(fetchedUsers);
                }
            },
            error: function (xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/auth/sign_in";
                } else {
                    setToast({ id: "err-toast", type: "error", message: "An internal error occurred. Please try again later.", onClose: () => setToast(null) });
                }
            },
        });

        setLoading(false);
        if (onLoad) onLoad();
    }, []);

    useEffect(() => {
        if (!token) {
            window.location.href = "/auth/sign_in";
        }
    }, [token]);

    if (loading) return null;

    return (
        {/* still working on this, no clue what to put here yet, probably a dashboard with recent messages, an open/closed chat count, team members, etc */}
    );
}

export default Home;
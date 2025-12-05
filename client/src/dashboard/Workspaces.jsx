import { api_url } from "../providers/config";
// ------------------------------------------------------- //
import { useState, useEffect, useCallback } from "react";
import { useDashboard } from "../providers/DashboardContext";
import { getInitials } from "../providers/utils.jsx";

function Workspaces({ onLoad }) {
    const { user, token, setToast, switchPage } = useDashboard();
    const [loading, setLoading] = useState(true);
    const [workspaces, setWorkspaces] = useState([]);

    const fetchWorkspaces = useCallback(() => {
        if (!token || !user) return;

        setWorkspaces(user.teams || []); // we alr have teams array
        return true;
    }, [token, user]);

    const deleteSelf = useCallback((id) => {
        if (!token || !user || !id) return;
        if (!confirm("Are you sure you want to leave this workspace? This action cannot be undone.")) return;

        const isCurrent = id === user.team?.id;

        $.ajax({
            url: (api_url + `/api/workspaces/${id}/users/${user.id}`),
            method: 'DELETE',
            data: { token: token },
            success: function (response) {
                if (response.success) {
                    setWorkspaces(prev => prev.filter(w => w.id !== id));
                    setToast({ id: "success-toast", type: "success", message: "You have left the workspace successfully.", onClose: () => setToast(null) });

                    if (isCurrent) {
                        const remaining = workspaces.filter(w => w.id !== id);

                        if (remaining.length > 0) {
                            localStorage.setItem("workspace", remaining[0].id);
                        } else {
                            localStorage.removeItem("workspace");
                        }

                        window.location.reload();
                    }
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
    }, [token, user, setToast]);

    useEffect(() => {
        if (!token || !user) return;

        fetchWorkspaces();

        setLoading(false);
        if (onLoad) onLoad();
    }, [token, user]); // don't need to include fetchWorkspaces since it already redefines on token/user change

    if (loading) return null;
    return (
        <div className="flex flex-col w-full h-full justify-start bg-white border border-gray-300 rounded-2xl py-4">
            <div className="flex items-center justify-between pb-4 px-6 mb-4 border-b border-gray-300">
                <div>
                    <h3 className="font-semibold text-xl">Your Workspaces</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => switchPage("create_workspace")} className="cursor-pointer px-4 py-2 bg-black/80 hover:bg-black/90 text-white rounded-xl text-sm font-medium transition flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Workspace
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
                <div className="h-full space-y-3">
                    {workspaces.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-16 mb-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                            </svg>

                            <p className="font-medium">You&apos;re not a member of any workspaces yet.</p>
                        </div>
                    ) : (
                        workspaces.map(workspace => {
                            const isCurrent = workspace.id === user.team?.id;

                            return (
                                <div key={workspace.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-black/80 rounded-xl flex items-center justify-center text-white font-semibold text-lg">{getInitials(workspace.name)}</div>

                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-900">{workspace.name}</h4>
                                                {isCurrent && (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Current</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">{workspace.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mr-2">
                                        {!isCurrent && (
                                            <button onClick={() => { localStorage.setItem("workspace", workspace.id); window.location.reload(); }} className="cursor-pointer px-4 py-2 bg-black/80 hover:bg-black/90 text-white rounded-xl text-sm font-medium transition flex items-center gap-1.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                                </svg>
                                                Switch
                                            </button>
                                        )}

                                        <div className="relative group">
                                            <button onClick={() => deleteSelf(workspace.id)} className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer hover:bg-red-50 hover:border-red-200">
                                                <svg className="w-4 h-4 text-gray-500 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                            </button>
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity group-hover:duration-300 group-hover:delay-200 duration-150 delay-0">
                                                Leave workspace
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default Workspaces;
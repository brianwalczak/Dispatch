import { api_url } from "../providers/config";
// ------------------------------------------------------- //
import { useState, useEffect, useCallback } from "react";
import InviteModal from "../components/InviteModal";
import { useDashboard } from "../providers/DashboardContext";
import { getInitials } from "../providers/utils.jsx";

function Home({ onLoad }) {
    const { user, token, members, switchPage, setToast } = useDashboard();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ open: 0, closed: 0 });
    const [showInvite, setShowInvite] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [users, setUsers] = useState([]);

    const fetchSessions = useCallback(async () => {
        if (!token || !user) return;

        $.ajax({
            url: (api_url + `/api/sessions/${user.team.id}`),
            method: 'POST',
            data: { token: token },
            success: function (response) {
                if (response.success && response.data) {
                    const recents = response.data.slice(0, 5); // first 5 sessions (alr sorted newest by backend)
                    const closed = response.data.filter(s => s.status === 'closed');

                    const todayclosed = closed.filter(s => {
                        const closedUTC = new Date(s.closedAt);
                        const todayUTC = new Date();

                        // apparently this is safer when converting from utc???
                        return (
                            closedUTC.getUTCFullYear() === todayUTC.getUTCFullYear() &&
                            closedUTC.getUTCMonth() === todayUTC.getUTCMonth() &&
                            closedUTC.getUTCDate() === todayUTC.getUTCDate()
                        );
                    }).length;

                    setStats({
                        open: response.data.filter(s => s.status === 'open').length, // get count of open sessions
                        closed: todayclosed // get count of closed sessions (today)
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
    }, [token, user, setToast]);

    const fetchTeam = useCallback(async () => {
        if (!token || !user) return;

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
    }, [token, user, setToast]);

    useEffect(() => {
        if (!token || !user) return;

        fetchSessions();
        fetchTeam();

        setLoading(false);
        if (onLoad) onLoad();
    }, [token, user]);

    if (loading) return null;
    return (
        <>
            {showInvite && (
                <InviteModal onClose={() => setShowInvite(false)} />
            )}

            <div className="flex flex-col w-full h-full justify-start gap-2">
                <div className="flex items-center justify-between p-6 bg-white border border-gray-300 rounded-2xl">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome back, {user.name.split(" ")[0]}! 👋</h1>
                        <p className="text-gray-500">Here&apos;s your {user.team.name} overview for today.</p>
                    </div>

                    <div>
                        <button onClick={() => switchPage("inbox")} className="cursor-pointer px-4 py-2 bg-black/80 hover:bg-black/90 text-white rounded-xl text-sm font-medium transition flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
                            </svg>
                            Go to Inbox
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2"> {/* 3 columns of stuff, gap of 2 like everything else */}
                    <div className="bg-white border border-gray-300 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-1">Open Conversations</p>
                                <p className="text-3xl text-gray-900 font-bold">{stats.open}</p>
                            </div>

                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 text-yellow-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                </svg>
                            </div>
                        </div>

                        {stats.open > 0 && (
                            <p className="text-xs text-yellow-600 font-medium mt-2">
                                {stats.open} conversation{stats.open === 1 ? "" : "s"} need{stats.open === 1 ? "s" : ""} attention
                            </p>
                        )}
                    </div>

                    <div className="bg-white border border-gray-300 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-1">Resolved Today</p>
                                <p className="text-3xl text-gray-900 font-bold">{stats.closed}</p>
                            </div>

                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-7 text-green-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                        </div>

                        <p className="text-xs text-green-600 font-medium mt-2">
                            {stats.closed === 0 ? "No conversations resolved yet" : "Great work!"}
                        </p>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-1">Team Members</p>
                                <p className="text-3xl text-gray-900 font-bold">{users.length}</p>
                            </div>

                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-6 text-blue-600">
                                    <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                                </svg>
                            </div>
                        </div>

                        <p className="text-xs text-blue-600 font-medium mt-2">
                            {members.length} member{members.length !== 1 ? 's' : ''} {members.length !== 1 ? 'are' : 'is'} currently online
                        </p>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-[2fr_1fr] gap-2 min-h-0"> {/* 2 columns, but one is 2/3 width and other is 1/3 cause its noicer */}
                    <div className="flex flex-col overflow-hidden bg-white border border-gray-300 rounded-2xl">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Recent Conversations</h3>
                            <p className="text-sm text-gray-500">View the latest activity across your inbox</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-16 mb-3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
                                    </svg>

                                    <p className="font-medium">No conversations yet</p>
                                    <p className="text-sm">Messages from your customers will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sessions.map(session => (
                                        <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-gray-400">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    </svg>
                                                </div>

                                                <div>
                                                    <p className="font-medium text-gray-900">Visitor ({session.id.toUpperCase()})</p>
                                                    <p className="text-sm text-gray-500">{session?.latestMessage?.content ?? "No messages yet."}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${session.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                    {session.status === 'open' ? 'Open' : 'Closed'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col overflow-hidden bg-white border border-gray-300 rounded-2xl">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Your Team</h3>
                            <p className="text-sm text-gray-500">{users.length} member{users.length !== 1 ? 's' : ''}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-3">
                                {[...users].sort((a, b) => {
                                    // keep us on top!
                                    if (a.id === user.id) return -1;
                                    if (b.id === user.id) return 1;

                                    // then sort by online status
                                    return members.includes(b.id) - members.includes(a.id);
                                }).map(member => (
                                    <div key={member.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-black/80 rounded-full flex items-center justify-center text-white font-semibold text-sm">{getInitials(member.name)}</div>
                                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${(members.includes(member.id)) ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 truncate">
                                                {member.name}
                                                {member.id === user.id && <span className="text-xs text-gray-400 ml-1">(You)</span>}
                                            </p>

                                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200">
                            <button onClick={() => setShowInvite(true)} className="w-full cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition flex items-center justify-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Invite Member
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;
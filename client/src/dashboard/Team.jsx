import { useState, useEffect } from "react";

function Team({ user, onLoad, setToast }) {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [token, setToken] = useState(localStorage.getItem("token"));

    function getInitials(name) {
        return name
            .split(" ")           // split into words
            .slice(0, 2)          // take up to the first 2 words for profile pictures
            .map(word => word[0]) // take first letter of each
            .join("")             // join letters together
            .toUpperCase();
    }

    const deleteUser = (userId) => {
        if (!userId) return;
        if (!confirm("Are you sure you want to remove this team member? This action cannot be undone.")) return;

        $.ajax({
            url: `/api/workspaces/${user.team.id}/users/${userId}`,
            method: 'DELETE',
            data: { token: token },
            success: function (response) {
                if (response.success) {
                    setUsers(users.filter(u => u.id !== userId));
                    setToast({ id: "success-toast", type: "success", message: "This team member has been removed successfully.", onClose: () => setToast(null) });
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
    };

    useEffect(() => {
        $.ajax({
            url: `/api/workspaces/${user.team.id}`,
            method: 'POST',
            data: { token: token },
            success: function (response) {
                if (response.data) {
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
        <div className="flex flex-col w-full h-full justify-start bg-white border border-gray-300 rounded-2xl py-4">
            <div className="flex items-center justify-between pb-4 px-6 mb-4 border-b border-gray-300">
                <div>
                    <h3 className="font-semibold text-xl">Team Members</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {users.length} member{users.length !== 1 ? 's' : ''} in {user.team.name}
                    </p>
                </div>

                <button onClick={() => alert("Hello there! I see you came from Summer of Making. Well, I'm unfortunately still working on this functionality and it's not quite ready yet (I didn't have enough time to finish by the end of the month).")} className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Invite Member
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
                <div className="space-y-3">
                    {users.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">{getInitials(member.name)}</div>

                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                                        {member.id === user.id && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">You</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{member.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 mr-4">
                                    <div className={`w-2 h-2 rounded-full ${(member.online || member.id === user.id) ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                                    <span className="text-xs text-gray-500">
                                        {(member.online || member.id === user.id) ? 'Online' : 'Offline'}
                                    </span>
                                </div>

                                <div className="relative group">
                                    <button onClick={() => member.id !== user.id && deleteUser(member.id)} className={`w-8 h-8 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center transition-all duration-200 ${member.id !== user.id && 'cursor-pointer hover:bg-red-50 hover:border-red-200'}`}>
                                        <svg className={`w-4 h-4 text-gray-500 ${member.id !== user.id && 'group-hover:text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity group-hover:duration-300 group-hover:delay-200 duration-150 delay-0">
                                        {member.id !== user.id ? "Remove member" : "Unable to remove"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Team;
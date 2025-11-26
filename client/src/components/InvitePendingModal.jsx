import { api_url } from "../providers/config";
// ------------------------------------------------------- //
import { useEffect, useState } from 'react';

const FADE_DURATION = 150; // ms

function InvitePendingModal({ user, token, setToast, onClose }) {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [invites, setInvites] = useState([]);

    // used to trigger fade in animation
    useEffect(() => {
        const id = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(id);
    }, []); // on mount

    useEffect(() => {
        if(!user || !token) return;
        
        $.ajax({
            url: (api_url + "/api/invites"),
            method: "POST",
            data: { token: token, teamId: user.team.id },
            success: (response) => {
                setInvites(response.data);
                setLoading(false);
            },
            error: (xhr) => {
                setLoading(false);

                if (xhr.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/auth/sign_in";
                } else {
                    setToast({ id: "err-toast", type: "error", message: (xhr.responseJSON?.error || "An internal error occurred. Please try again later."), onClose: () => setToast(null) });
                }
            }
        });
    }, []);

    const handleClose = () => {
        setVisible(false);
        if (onClose) setTimeout(onClose, FADE_DURATION); // wait for animation before closing
    };

    const deleteInvite = (id) => {
        $.ajax({
            url: (api_url + `/api/invites/${id}`),
            method: "DELETE",
            data: { token: token },
            success: () => {
                setInvites(invites.filter(i => i.id !== id));
                setToast({ id: "success-toast", type: "success", message: "This invite has been successfully cancelled.", onClose: () => setToast(null) });
            },
            error: (xhr) => {
                if (xhr.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/auth/sign_in";
                } else {
                    setToast({ id: "err-toast", type: "error", message: (xhr.responseJSON?.error || "An internal error occurred. Please try again later."), onClose: () => setToast(null) });
                }
            }
        });
    };

    return (
        <div className={`fixed inset-0 bg-[#eff1ea]/80 backdrop-blur-xs flex items-center justify-center z-50 transition-opacity duration-${FADE_DURATION} ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-white/70 rounded-2xl shadow-lg max-w-md w-full mx-4 p-6 border border-gray-400/30 transition-all duration-${FADE_DURATION} ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-semibold">Pending Invites</h2>
                    <button onClick={handleClose} className="cursor-pointer size-8 flex items-center justify-center rounded-lg border border-transparent hover:bg-white/50 hover:border-gray-400/30 transition text-gray-500 hover:text-gray-700">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-sm text-gray-500 mb-5">These invites have been sent and not yet accepted.</p>

                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div> {/* loading spinner! */}
                    </div>
                ) : invites.length === 0 ? (
                    <div className="flex items-center justify-center py-4 text-gray-500 text-sm">
                        No pending invites
                    </div>
                ) : (
                    <div className="overflow-y-auto space-y-2 max-h-52">
                        {invites.map(invite => (
                            <div key={invite.id} className="flex items-center justify-between p-3 bg-white/50 border border-gray-400/30 rounded-xl">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{invite.email}</p>
                                    <p className="text-xs text-gray-500 truncate">Expires on {new Date(invite.expiresAt).toLocaleDateString()}</p>
                                </div>
                                
                                <button onClick={() => deleteInvite(invite.id)} className="cursor-pointer ml-3 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default InvitePendingModal;
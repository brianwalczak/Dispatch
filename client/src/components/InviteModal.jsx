import { api_url } from "../providers/config";
// ------------------------------------------------------- //
import { useDashboard } from "../providers/DashboardContext";
import { useEffect, useState, useCallback } from 'react';

const FADE_DURATION = 150; // ms

function InviteModal({ onClose }) {
    const { user, token, setToast } = useDashboard();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    // used to trigger fade in animation
    useEffect(() => {
        const id = requestAnimationFrame(() => setVisible(true));
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            cancelAnimationFrame(id);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []); // on mount

    const handleClose = useCallback(() => {
        setVisible(false);
        if (onClose) setTimeout(onClose, FADE_DURATION); // wait for animation before closing
    }, [onClose]);

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            handleClose();
        }
    };

    const handleClickAway = (e) => {
        if (e.target === e.currentTarget) { // only if it's the bg
            handleClose();
        }
    };

    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !emailRegex.test(email)) {
            setToast({ id: "err-toast", type: "error", message: "Please enter a valid email address.", onClose: () => setToast(null) });
            return;
        }

        setLoading(true);

        $.ajax({
            url: (api_url + "/api/invites/new"),
            method: "POST",
            data: { token, teamId: user.team.id, email: email.trim() },
            success: function (response) {
                if (response.success) {
                    setToast({ id: "success-toast", type: "success", message: `An invite to join ${user.team.name} has been sent successfully.`, onClose: () => setToast(null) });
                    setLoading(false);
                    handleClose();
                }
            },
            error: function (xhr) {
                setLoading(false);

                if (xhr.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/auth/sign_in";
                } else {
                    setToast({ id: "err-toast", type: "error", message: (xhr.responseJSON?.error || "An internal error occurred. Please try again later."), onClose: () => setToast(null) });
                }
            }
        });
    }, [email, token, user, setToast, handleClose]);

    return (
        <div className={`fixed inset-0 bg-[#eff1ea]/80 backdrop-blur-xs flex items-center justify-center z-50 transition-opacity duration-${FADE_DURATION} ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={handleClickAway}>
            <div className={`bg-white/70 rounded-2xl shadow-lg max-w-md w-full mx-4 p-6 border border-gray-400/30 transition-all duration-${FADE_DURATION} ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Invite Team Member</h2>
                    <button onClick={handleClose} className="cursor-pointer size-8 flex items-center justify-center rounded-lg border border-transparent hover:bg-white/50 hover:border-gray-400/30 transition text-gray-500 hover:text-gray-700">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-sm text-gray-500 mb-5">Enter the email address of the user you&apos;d like to invite to your workspace.</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className="w-full px-4 py-2.5 bg-white/50 border border-gray-400/30 rounded-xl focus:bg-white focus:border-gray-400/50 outline-none transition text-gray-700 placeholder-gray-400" disabled={loading} />
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={handleClose} className="flex-1 px-4 py-2.5 cursor-pointer text-gray-600 bg-white/50 hover:bg-white border border-gray-400/30 rounded-xl font-medium transition disabled:opacity-50" disabled={loading}>Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2.5 cursor-pointer bg-black/80 hover:bg-black/90 text-white rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2" disabled={loading}>
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> {/* loading spinner! */}
                                Sending...
                            </>
                            ) : (
                                "Send Invite"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default InviteModal;
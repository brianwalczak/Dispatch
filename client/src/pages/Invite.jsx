import { api_url } from "../providers/config";
// ------------------------------------------------------- //
import { useState, useEffect } from "react";

function Invite({ id, token: tokenI }) {
    const [token] = useState(localStorage.getItem("token"));
    const [invite, setInvite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        $.ajax({
            url: (api_url + `/api/invites/${id}`),
            method: "POST",
            success: (response) => {
                setInvite(response.data);
                setLoading(false);
            },
            error: (xhr) => {
                setError(xhr.responseJSON?.error || "Whoops, your invite is no longer valid or has already been accepted.");
                setLoading(false);
            }
        });
    }, [id]);

    const handleRedirect = (method) => {
        window.location.href = `/auth/${method}/?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    };

    const handleAccept = () => {
        if (!token) {
            handleRedirect(invite?.isUser ? 'sign_in' : 'sign_up');
            return;
        }

        setAccepting(true);

        $.ajax({
            url: (api_url + `/api/invites/${id}/accept?token=${tokenI}`),
            method: "POST",
            data: { token: token },
            success: (response) => {
                localStorage.setItem("workspace", response.id);
                window.location.href = "/";
            },
            error: (xhr) => {
                setError(xhr.responseJSON?.error || "Whoops, your invite could not be accepted. Please try again later.");
                setAccepting(false);
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#eff1ea] flex items-center justify-center p-4">
                <div className="flex flex-col items-center text-gray-500 justify-center h-full">
                    <div className="w-16 h-16 border-6 border-gray-300 border-t-gray-500 rounded-full animate-spin mb-3"></div>
                    <p className="text-xl font-medium">Finding your invite...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            {/* gonna do it later lol */}
        );
    }

    return (
        <div className="min-h-screen bg-[#eff1ea] flex items-center justify-center p-4">
            <div className="bg-white/70 rounded-2xl shadow-lg max-w-md w-full mx-4 p-6 border border-gray-400/30">
                <div className="flex flex-col items-center justify-between mb-5">
                    <div className="w-20 h-20 bg-black/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-12 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-semibold mb-1 text-center">You're Invited!</h2>
                    <p className="text-base text-gray-500 text-center">You were invited to join a workspace on Dispatch.</p>
                </div>

                <div className="bg-gray-50 border border-gray-400/30 rounded-2xl p-5 mb-3">
                    <h2 className="text-xl font-semibold mb-1 text-gray-800">{invite.team.name}</h2>
                    <p className="text-sm mb-3 text-gray-600">{invite.team.description}</p>

                    <div className="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 mr-1.5">
                            <path fillRule="evenodd" d="M17.834 6.166a8.25 8.25 0 1 0 0 11.668.75.75 0 0 1 1.06 1.06c-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788 3.807-3.808 9.98-3.808 13.788 0A9.722 9.722 0 0 1 21.75 12c0 .975-.296 1.887-.809 2.571-.514.685-1.28 1.179-2.191 1.179-.904 0-1.666-.487-2.18-1.164a5.25 5.25 0 1 1-.82-6.26V8.25a.75.75 0 0 1 1.5 0V12c0 .682.208 1.27.509 1.671.3.401.659.579.991.579.332 0 .69-.178.991-.579.3-.4.509-.99.509-1.671a8.222 8.222 0 0 0-2.416-5.834ZM15.75 12a3.75 3.75 0 1 0-7.5 0 3.75 3.75 0 0 0 7.5 0Z" clipRule="evenodd" />
                        </svg>

                        Invited as: <span className="font-medium ml-1">{invite.email}</span>
                    </div>
                </div>

                <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 mr-1.5">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                    </svg>

                    Expires {(() => {
                        // checks if there's at least 1 day or hour left, otherwise just says soon :]
                        const ms = new Date(invite.expiresAt) - new Date();
                        const hours = Math.floor(ms / (1000 * 60 * 60));
                        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

                        if (days >= 1) {
                            return `in ${days} day${days === 1 ? '' : 's'}`;
                        } else if (hours >= 1) {
                            return `in ${hours} hour${hours === 1 ? '' : 's'}`;
                        } else {
                            return 'soon';
                        }
                    })()}
                </div>

                <div className="flex">
                    <button onClick={handleAccept} className="flex-1 px-4 py-2.5 cursor-pointer bg-black/80 hover:bg-black/90 text-white rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2" disabled={accepting}>
                        {accepting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> {/* loading spinner! */}
                                Joining...
                            </>
                        ) : token ? (
                            "Accept Invite"
                        ) : invite?.isUser ? (
                            "Sign In to Join"
                        ) : (
                            "Sign Up to Join"
                        )}
                    </button>
                </div>

                {/* adding this just in case */}
                {!token && (invite?.isUser ? (
                    <p className="text-center text-gray-500 text-sm mt-4">
                        Don't have an account? <button onClick={() => handleRedirect('sign_up')} className="text-gray-900 font-medium hover:underline cursor-pointer">Sign up</button>
                    </p>
                ) : (
                    <p className="text-center text-gray-500 text-sm mt-4">
                        Already have an account? <button onClick={() => handleRedirect('sign_in')} className="text-gray-900 font-medium hover:underline cursor-pointer">Sign in</button>
                    </p>
                ))}
            </div>
        </div>
    );
}

export default Invite;
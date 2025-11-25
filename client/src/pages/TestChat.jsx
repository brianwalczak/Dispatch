import { api_url, socket_url } from "../providers/config";
// ------------------------------------------------------- //
import { useState, useRef, useEffect } from "react";
import Toast from "../components/Toast";
import { io } from "socket.io-client";

function TestChat() {
    const DEFAULT_TEAM_ID = new URLSearchParams(window.location.search).get("workspace") || null;
    const [session, setSession] = useState(null);
    const [auth, setAuth] = useState(null);
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [toast, setToast] = useState(null);
    const chatEnd = useRef(null);

    useEffect(() => {
        chatEnd.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, session]);

    const createSession = async () => {
        try {
            const response = await $.ajax({
                url: (api_url + `/api/sessions/create`),
                method: 'POST',
                data: { teamId: DEFAULT_TEAM_ID },
            });

            if (response.data) {
                setSession(response.data);
                setMessages(response.data.messages || []);
                setAuth({ token: response.data.token, id: response.data.id });

                return response.data;
            }

            return null;
        } catch (err) {
            setToast({ id: "err-toast", type: "error", message: "An internal error occurred. Please try again later.", onClose: () => setToast(null) });
            throw err;
        }
    };

    const getSession = (data) => {
        if (!data || !data.token || !data.id) return;

        $.ajax({
            url: (api_url + `/api/session/${data.id}`),
            method: 'POST',
            data: { type: "visitor", token: data.token },
            success: function (response) {
                if (response.data && response.data.messages) {
                    setSession(response.data);
                    setMessages(response.data.messages || []);
                    setAuth({ token: data.token, id: data.id });

                    return response.data;
                }
            },
            error: function (xhr) {
                if (xhr.status === 401 || xhr.status === 404) {
                    localStorage.removeItem("session");
                } else {
                    setToast({ id: "err-toast", type: "error", message: "An internal error occurred. Please try again later.", onClose: () => setToast(null) });
                }
            },
        });
    };

    useEffect(() => {
        if (!auth || !auth.token || !auth.id) return;
        if (socket) socket.disconnect();

        const newSocket = io(socket_url, { auth: { type: "visitor", token: auth.token, id: auth.id } });
        setSocket(newSocket);

        localStorage.setItem("session", JSON.stringify(auth)); // save session
        return () => {
            newSocket.disconnect();
        };
    }, [auth]);

    useEffect(() => {
        if (!socket) return;

        // New message was sent by either an agent or a visitor
        const newMessage = (msg) => {
            setSession(prevSession => {
                if (!prevSession || msg.sessionId !== prevSession.id) return prevSession;

                // acknowledge that the visitor has seen this message (if message is coming from an agent, NOT itself)
                if (msg.sender) socket.emit("messages_read", { id: prevSession.id });

                setMessages(prevMessages => {
                    if (prevMessages.find(m => m.id === msg.id)) return prevMessages;

                    const newMessages = [...prevMessages, msg]; // add new message

                    // Sort by ascending (oldest first)
                    newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    return newMessages;
                });

                return prevSession;
            });
        };

        // Session was permanently deleted by an agent
        const sessionDelete = (msg) => {
            setSession(prevSession => {
                if (!prevSession || msg.id !== prevSession.id) return prevSession;

                setToast({ id: "info-toast", type: "warning", message: "Your conversation has been deleted by an agent.", onClose: () => setToast(null) });
                setMessages([]);
                localStorage.removeItem("session");

                setSocket(prevSocket => {
                    if (prevSocket) prevSocket.disconnect();
                    return null;
                });

                return null;
            });
        };

        // Session was updated (status change) by an agent
        const sessionUpdate = (msg) => {
            setSession(prevSession => {
                if (!prevSession || msg.id !== prevSession.id) return prevSession;

                const updatedSession = { ...prevSession, ...msg };

                if (msg.status === 'closed') {
                    setToast({ id: "info-toast", type: "warning", message: "Your conversation has been closed by an agent.", onClose: () => setToast(null) });
                } else if (msg.status === 'open') {
                    setToast({ id: "info-toast", type: "success", message: "Your conversation has been reopened by an agent.", onClose: () => setToast(null) });
                }

                return updatedSession;
            });
        };

        // Acknowledge that agent has read messages
        const messagesRead = () => {
            setMessages(prevMessages => prevMessages.map(m => !(m.sender) ? { ...m, read: true } : m)); // mark all as read
        };

        socket.on("new_message", newMessage);
        socket.on("session_delete", sessionDelete);
        socket.on("session_update", sessionUpdate);
        socket.on("messages_read", messagesRead);

        return () => {
            socket.off("new_message", newMessage);
            socket.off("session_delete", sessionDelete);
            socket.off("session_update", sessionUpdate);
            socket.off("messages_read", messagesRead);

            if (socket) {
                socket.disconnect();
            }
        };
    }, [socket]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("session");
            if (!saved) return;

            const data = JSON.parse(saved);
            if (data && data.token && data.id) return getSession(data);
        } catch {/* ignore */};
    }, []); // on mount

    const sendMessage = async () => {
        let currentAuth = auth;
        let currentSession = session;

        if (!currentAuth || !currentAuth.token || !currentAuth.id) {
            // Try to create a session, which will also set auth
            currentSession = await createSession();
            currentAuth = { token: currentSession?.token, id: currentSession?.id };
            if (!currentSession || !currentAuth.token || !currentAuth.id) return; // failed to create session
        }

        if (currentSession && currentSession.status === 'closed') return setToast({ id: "err-toast", type: "error", message: "This conversation has been closed. You are unable to make any changes.", onClose: () => setToast(null) });
        const message = $("#message").val();
        if (!message || message.length === 0 || message.length > 500) return setToast({ id: "err-toast", type: "error", message: "Your message must be between 1 and 500 characters.", onClose: () => setToast(null) });

        $.ajax({
            url: (api_url + `/api/session/${currentAuth.id}/create`),
            method: 'POST',
            data: { type: "visitor", token: currentAuth.token, message: message },
            success: function (response) {
                setMessages(prevMessages => {
                    if (!prevMessages.find(m => m.id === response.data.id)) {
                        return [...prevMessages, response.data];
                    }

                    return prevMessages;
                });

                $("#message").val("");
                $("#message").css("height", "auto");
            },
            error: function (xhr) {
                if (xhr.status === 401 || xhr.status === 404) {
                    // handle session deleted by agent
                    setToast({ id: "info-toast", type: "warning", message: "Your conversation couldn't be loaded. It may have been deleted by an agent.", onClose: () => setToast(null) });
                    setSession(null);
                    setMessages([]);
                    localStorage.removeItem("session");

                    if (socket) {
                        socket.disconnect();
                    }
                } else {
                    setToast({ id: "err-toast", type: "error", message: "An internal error occurred. Please try again later.", onClose: () => setToast(null) });
                }
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            {toast && <Toast {...toast} />}

            <div className="bg-white border border-gray-300 rounded-2xl shadow-xl w-full max-w-md h-[600px] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                                <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-base">Conversation Demo (Dispatch)</h3>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {messages.length === 0 && (
                        <div className="flex justify-center items-center h-full text-gray-500">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 text-gray-400">
                                        <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-sm">Start a conversation here.</p>
                            </div>
                        </div>
                    )}

                    {session && session.createdAt && (
                        <div className="flex justify-center text-gray-400 text-center text-xs mb-4">This conversation was created on {new Date(session.createdAt).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: true })}</div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`mb-4 flex ${msg.sender ? "justify-start" : "justify-end"}`}>
                            <div className={`max-w-xs px-4 py-2 rounded-xl shadow-sm ${msg.sender ? "bg-white text-gray-800 border border-gray-200" : "bg-blue-600 text-white"}`}>
                                <div className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                                <div className={`text-xs mt-1 ${msg.sender ? "text-gray-500" : "text-blue-100"}`}>
                                    {msg?.sender?.name ?? (msg.read ? 'Seen' : 'Not seen')} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {session && session.status === 'closed' && session.closedAt && (
                        <div className="flex justify-center text-gray-400 text-center text-xs mt-4">This conversation was closed on {new Date(session.closedAt).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: true })}</div>
                    )}

                    <div ref={chatEnd} />
                </div>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                        <div className="flex-1 flex items-center bg-gray-100 rounded-lg border border-gray-200 px-3 py-2">
                            <textarea id="message" placeholder="Type your message..." rows="1" className="w-full bg-transparent text-gray-700 placeholder-gray-400 resize-none focus:outline-none text-sm" style={{ minHeight: '20px', maxHeight: '80px' }} onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'; }} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
                        </div>
                        <button onClick={(e) => { e.preventDefault(); sendMessage(); }} className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-lg transition-colors flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TestChat;
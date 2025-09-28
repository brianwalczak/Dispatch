import { useState, useEffect } from "react";
import { Dropdown, closeMenu } from "../components/Dropdown";

function Inbox({ user, onLoad, socket, setToast }) {
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const [messages, setMessages] = useState([]);

    const [filter, setFilter] = useState("open"); // "open" or "closed"
    const [selected, setSelected] = useState(null); // session ID
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const getMessages = () => {
        if (!selected || !socket) return;

        $.ajax({
            url: `http://localhost:3000/api/session/${selected}`,
            method: 'POST',
            data: { type: "agent", token: token },
            success: function (response) {
                if (response.data && response.data.messages) {
                    setMessages(response.data.messages);
                    setIsInitialLoad(true);
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

    const sendMessage = (close = false) => {
        if (!selected || !socket) return;

        const message = $("#message").val();
        if (!message || message.length === 0 || message.length > 500) return setToast({ id: "err-toast", type: "error", message: "Your message must be between 1 and 500 characters.", onClose: () => setToast(null) });

        $.ajax({
            url: `http://localhost:3000/api/session/${selected}/create`,
            method: 'POST',
            data: { type: "agent", token: token, message: message },
            success: function (response) {
                if (response.data) {
                    setMessages([...messages, response.data]);
                    setIsInitialLoad(false); // New message, not initial load
                }

                $("#message").val("");
                $("#message").css("height", "auto");
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

        if (close) return setConversation("closed");
    };

    const setConversation = (status) => {
        if (!selected || !socket) return;

        $.ajax({
            url: `http://localhost:3000/api/session/${selected}`,
            method: 'PATCH',
            data: { token: token, status },
            success: function (response) {
                if (response.success) {
                    // Predict the next session in the list (preferably the next one, otherwise the previous one)
                    const tabSessions = sessions.filter(session => session.status === filter);
                    const index = tabSessions.findIndex(session => session.id === selected);
                    const nextSession = (tabSessions[index + 1] || tabSessions[index - 1])?.id || null;

                    // Set the sessions with the updated session state
                    let newSessions;
                    if (status === 'delete') {
                        newSessions = sessions.filter(session => session.id !== selected);
                    } else {
                        newSessions = sessions.map(session => session.id === selected ? response.data : session);
                    }
                    setSessions(newSessions);

                    if (status === 'closed' || status === 'delete') {
                        // move on to next item
                        if (nextSession) {
                            setSelected(nextSession);
                            // if there is no next item, fallback to whatever is available
                        } else if (newSessions.find(session => session.status === filter)) {
                            setSelected(newSessions.find(session => session.status === filter).id);
                            // if there's still nothing, just show them the no messages screen
                        } else {
                            setSelected(null);
                        }
                    } else if (status === 'open') {
                        // always move back to open and stay on existing item
                        setFilter('open');
                        setSelected(response.data.id);
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
    };

    useEffect(() => {
        $.ajax({
            url: `http://localhost:3000/api/sessions/${user.team.id}`,
            method: 'POST',
            data: { token: token },
            success: function (response) {
                setSessions(response.data);
                setSelected(response.data?.find(session => session.status === 'open')?.id || null); // try to find first open session
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

    useEffect(() => {
        if (!socket) return;

        socket.on("message", (msg) => {
            // this should be changed later (stats for nerds)
            setToast({ id: "msg-toast", type: "success", message: "A message has been received, check the console.", onClose: () => setToast(null) });
            console.log(msg);
        });
    }, [socket]);

    useEffect(() => {
        if (!messages) return;
        const end_container = $("#chat-end")[0]?.parentElement;
        const end = $("#chat-end")[0];

        if (isInitialLoad && end_container) {
            // For initial load, instantly scroll to bottom without animation
            end_container.scrollTop = end_container.scrollHeight;
            setIsInitialLoad(false);
        } else if (end) {
            // For new messages, use smooth scrolling cuz it's nicer
            end.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        if (selected && socket) {
            setIsInitialLoad(true); // reset da flag when switching conversations
            getMessages();
        }
    }, [selected, socket]);

    if (loading) return null;
    return (
        <div className="flex gap-2 bg-transparent h-full">
            <div className="flex flex-col w-[20%] bg-white border border-gray-300 rounded-2xl py-4">
                {/* Active: bg-gray-200/50 border-gray-400/30 */}
                {/* Inactive: border-transparent bg-white hover:bg-gray-200/10 hover:border-gray-400/30 transition */}
                <div className="flex flex-col mx-4 lg:flex-row justify-center gap-2 mb-4">
                    <button onClick={() => setFilter("open")} className={`px-2 sm:px-3 md:px-4 py-1 font-semibold rounded-full cursor-pointer border text-xs sm:text-sm md:text-base ${filter === "open" ? "bg-gray-200/50 border-gray-400/30" : "border-transparent bg-white hover:bg-gray-200/10 hover:border-gray-400/30 transition"}`}>
                        <span className="truncate">{sessions.filter(session => session.status === 'open').length} Open</span>
                    </button>
                    <button onClick={() => setFilter("closed")} className={`px-2 sm:px-3 md:px-4 py-1 font-semibold rounded-full cursor-pointer border text-xs sm:text-sm md:text-base ${filter === "closed" ? "bg-gray-200/50 border-gray-400/30" : "border-transparent bg-white hover:bg-gray-200/10 hover:border-gray-400/30 transition"}`}>
                        <span className="truncate">{sessions.filter(session => session.status === 'closed').length} Closed</span>
                    </button>
                </div>

                <div className="flex-1 flex flex-col gap-2 overflow-y-auto px-4">
                    {sessions.filter(session => session.status === filter).map(session => (
                        <div key={session.id} onClick={() => setSelected(session.id)} className={`p-3 rounded-xl cursor-pointer border ${selected === session.id ? "bg-gray-200/50 border-gray-400/30" : "border-transparent bg-white hover:bg-gray-200/10 hover:border-gray-400/30 transition"}`}>
                            <div className="font-bold text-sm truncate">Visitor ({session.id.toUpperCase()})</div>
                            <div className="text-xs text-gray-500 truncate">{session?.latestMessage?.content ?? "No messages yet."}</div>
                            <div className="text-xs text-right text-gray-400">{new Date(session?.latestMessage?.createdAt ?? session?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                    ))}

                    {sessions.filter(session => session.status === filter).length === 0 && (
                        <div className="flex justify-center text-center text-gray-400 mt-10">No {filter} conversations found.</div>
                    )}
                </div>
            </div>

            <div className="flex flex-col w-[80%] bg-white border border-gray-300 rounded-2xl p-4 min-h-0">
                {selected && sessions.find(session => session.id === selected) ? (
                    <>
                        <div className="flex items-center justify-between pb-4 pl-6 pr-6 mb-4 border-b border-gray-300">
                            <h3 className="font-semibold text-xl">Messages</h3>

                            <div className="flex items-center gap-4">
                                {sessions.find(session => session.id === selected)?.status === 'open' ? (
                                    <div className="relative group">
                                        <button onClick={() => setConversation("closed")} className="cursor-pointer w-10 h-10 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-full flex items-center justify-center transition-all duration-200">
                                            <svg className="w-5 h-5 text-red-600 group-hover:text-red-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity group-hover:duration-300 group-hover:delay-200 duration-150 delay-0">
                                            Close conversation
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <button onClick={() => setConversation("open")} className="cursor-pointer w-10 h-10 bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 rounded-full flex items-center justify-center transition-all duration-200">
                                            <svg className="w-5 h-5 text-green-600 group-hover:text-green-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 0 1-1.5 0V6.75a3.75 3.75 0 1 0-7.5 0v3a3 3 0 0 1 3 3v6.75a3 3 0 0 1-3 3H3.75a3 3 0 0 1-3-3v-6.75a3 3 0 0 1 3-3h9v-3c0-2.9 2.35-5.25 5.25-5.25Z" />
                                            </svg>
                                        </button>

                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity group-hover:duration-300 group-hover:delay-200 duration-150 delay-0">
                                            Open conversation
                                        </div>
                                    </div>
                                )}

                                <div className="relative group">
                                    <button onClick={() => setConversation("delete")} className="cursor-pointer w-10 h-10 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-full flex items-center justify-center transition-all duration-200">
                                        <svg className="w-5 h-5 text-gray-500 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity group-hover:duration-300 group-hover:delay-200 duration-150 delay-0">
                                        Delete conversation
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-6">
                            <div className="flex justify-center text-gray-400 text-center">This conversation was created on {new Date(sessions.find(session => session.id === selected)?.createdAt).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: true })}</div>

                            {messages.map(msg => {
                                if (msg.sender && msg.sender.id === user.id) { // check if it's an agent (aka. will have a senderId attached)
                                    return (<div key={msg.id} className="flex flex-col items-end">
                                        <div className="bg-gray-100 text-gray-900 rounded-xl px-4 py-2 max-w-xs shadow mb-1" style={{ whiteSpace: 'pre-wrap' }}>
                                            {msg.content}
                                        </div>
                                        <span className="text-sm text-gray-400 mr-2">{msg.read ? 'Seen' : 'Not seen'} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>);
                                } else {
                                    return (<div key={msg.id} className="flex flex-col items-start">
                                        <div className="bg-blue-100 text-blue-900 rounded-xl px-4 py-2 max-w-xs shadow mb-1" style={{ whiteSpace: 'pre-wrap' }}>
                                            {msg.content}
                                        </div>
                                        <span className="text-sm text-gray-400 ml-2">{msg.sender ? msg.sender.name : "Visitor"} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>);
                                }
                            })}

                            {sessions.find(session => session.id === selected)?.status === 'closed' && (
                                <div className="flex justify-center text-gray-400 text-center">This conversation was closed on {new Date(sessions.find(session => session.id === selected)?.closedAt).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: true })}</div>
                            )}

                            {/* small element which will lets us scroll */}
                            <div id="chat-end" />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-8">
                        <div className="text-center mb-4 sm:mb-8">
                            <div className="inline-block mb-2">
                                <svg className="w-8 h-8 sm:w-12 md:w-16 sm:h-12 md:h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">All caught up! 🎉</h3>
                            <p className="text-sm sm:text-lg md:text-xl text-gray-600 leading-relaxed px-2">Amazing work, <span className="font-semibold text-blue-600">{user.name.split(" ")[0]}</span>! You've handled all your conversations like a pro.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-8 w-full max-w-4xl">
                            <div className="flex flex-col items-center text-center bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2 sm:mb-4">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>

                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg mb-1 sm:mb-2">Take a break</h4>
                                <p className="text-gray-600 text-xs sm:text-sm">You've earned some time to stay alert for new conversations. Great work!</p>
                            </div>

                            <div className="flex flex-col items-center text-center bg-green-50 border border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mb-2 sm:mb-4">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                                    </svg>
                                </div>

                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg mb-1 sm:mb-2">New messages</h4>
                                <p className="text-gray-600 text-xs sm:text-sm">New conversations will automatically appear here when they arrive.</p>
                            </div>

                            <div className="flex flex-col items-center text-center bg-purple-50 border border-purple-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 sm:col-span-2 lg:col-span-1">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2 sm:mb-4">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>

                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg mb-1 sm:mb-2">Stay productive</h4>
                                <p className="text-gray-600 text-xs sm:text-sm">Perfect response times keep visitors happy and engaged.</p>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-2 sm:px-4">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-xs sm:text-sm text-gray-600 font-medium">Ready for new conversations</span>
                            </div>
                        </div>
                    </div>
                )}

                {selected && sessions.find(session => session.id === selected) && (
                    <div className="mt-4 px-6">
                        <div id="reply-box" className="flex gap-3 bg-gray-50 rounded-2xl border border-gray-200 p-4">
                            <div className="flex items-center gap-1 text-gray-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 8l3.707-3.707a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium leading-6">Reply</span>
                            </div>

                            <div className="flex-1 flex flex-row gap-2">
                                <div className="flex items-center flex-1">
                                    <textarea id="message" placeholder="Enter your message..." rows="1" className="w-full bg-transparent text-gray-700 placeholder-gray-400 resize-none focus:outline-none text-sm font-medium leading-6 align-middle overflow-y-auto" style={{ minHeight: '24px', maxHeight: '240px' }} onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 240) + 'px'; }} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(false); } }} />
                                </div>
                                <div className="flex items-end">
                                    <div className="inline-flex">
                                        <button className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-l-full text-sm font-medium transition border-r-1 border-white/50" onClick={() => { sendMessage(false); }}>Send</button>

                                        <Dropdown type="send" position="right-15 bottom-22" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 rounded-r-full text-sm font-medium transition flex items-center">
                                            <div className="button">
                                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="menu">
                                                {sessions.find(session => session.id === selected)?.status === 'open' && (
                                                    <>
                                                        <button onClick={() => { closeMenu("send"); sendMessage(true); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-1 font-medium text-blue-600">
                                                            <svg className="w-3.5 h-3.5 text-blue-600 mt-[2px] mr-[2px]" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
                                                            </svg>
                                                            <span>Send and Close</span>
                                                        </button>


                                                        <button onClick={() => { closeMenu("send"); setConversation("closed"); }} className="w-full min-w-max text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-1 font-medium text-red-600">
                                                            <svg className="w-4 h-4 text-red-600 mt-[2px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>Close Conversation</span>
                                                        </button>
                                                    </>
                                                )}

                                                {sessions.find(session => session.id === selected)?.status === 'closed' && (
                                                    <>
                                                        <button onClick={() => { closeMenu("send"); setConversation("open"); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-1 font-medium text-green-600">
                                                            <svg className="w-3.5 h-3.5 text-green-600 mt-[2px] mr-[2px]" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 0 1-1.5 0V6.75a3.75 3.75 0 1 0-7.5 0v3a3 3 0 0 1 3 3v6.75a3 3 0 0 1-3 3H3.75a3 3 0 0 1-3-3v-6.75a3 3 0 0 1 3-3h9v-3c0-2.9 2.35-5.25 5.25-5.25Z" />
                                                            </svg>

                                                            <span>Open Conversation</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Inbox;
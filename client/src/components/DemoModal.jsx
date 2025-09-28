import { useState, useEffect } from 'react';

function DemoModal() {
    const [visible, setVisible] = useState(false);
    const [seenDemo, setSeenDemo] = useState(false);

    useEffect(() => {
        const seenDemo = localStorage.getItem('seenDemo');
        
        if (!seenDemo) {
            setVisible(true);
        } else {
            setSeenDemo(true);
        }
    }, []);

    const handleClose = () => {
        setVisible(false);
        localStorage.setItem('seenDemo', 'true');

        setSeenDemo(true);
    };

    if (!visible || seenDemo) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Welcome to Dispatch!</h2>
                    <button onClick={handleClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex justify-center mb-6">
                    <img src="/wave.gif" className="w-32 h-32 object-contain" />
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 leading-relaxed mb-4">Hello there! Thanks for checking out my project. 👋</p>
                    <p className="text-gray-600 leading-relaxed mb-4">Dispatch is still under construction, but I'd love to show you what I've built so far! This is a team communication platform designed to streamline customer interactions, but without all the AI junk and useless features in the other services, like Intercom.</p>
                    <p className="text-gray-600 leading-relaxed">Would you like to demo the chat functionality as a site visitor to test out your workspace? I'll open it in a new tab for you :D</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={handleClose} className="cursor-pointer flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                      Maybe Later
                    </button>
                    <button onClick={() => window.open("/test/?workspace=" + localStorage.getItem('workspace')) && handleClose()} className="cursor-pointer flex-1 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
                      Try Demo
                    </button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">This modal won't show again after you dismiss it, choose wisely!</p>
            </div>
        </div>
    );
}

export default DemoModal;
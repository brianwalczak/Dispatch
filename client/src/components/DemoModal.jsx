import { useEffect, useState } from 'react';

const FADE_DURATION = 150; // ms

function DemoModal() {
    const [visible, setVisible] = useState(false);

    // used to trigger fade in animation
    useEffect(() => {
        const hasSeen = localStorage.getItem('seenDemo');

        if (!hasSeen) {
            let id = null;

            setTimeout(() => {
                id = requestAnimationFrame(() => setVisible(true));
            }, 500); // delay so it's neater :]

            return () => cancelAnimationFrame(id);
        }
    }, []); // on mount

    const handleClose = () => {
        setVisible(false);
        localStorage.setItem('seenDemo', 'true');
    };

    return (
        <div className={`fixed inset-0 bg-[#eff1ea]/80 backdrop-blur-xs flex items-center justify-center z-50 transition-opacity duration-${FADE_DURATION} ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white/70 rounded-2xl shadow-lg max-w-md w-full mx-4 p-6 border border-gray-400/30 transition-all duration-${FADE_DURATION} ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Welcome to Dispatch!</h2>
                    <button onClick={handleClose} className="cursor-pointer size-8 flex items-center justify-center rounded-lg border border-transparent hover:bg-white/50 hover:border-gray-400/30 transition text-gray-500 hover:text-gray-700">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex justify-center mb-6">
                    <img src="/wave.gif" className="w-32 h-32 object-contain" />
                </div>

                <p className="text-sm text-gray-500 mb-5">
                    Hello there! Thanks for checking out my project. 👋
                </p>

                <p className="text-sm text-gray-500 mb-5">
                    Dispatch is still under construction, but I&apos;d love to show you what I&apos;ve built so far! This is a team communication platform designed to streamline customer interactions, but without all the AI junk and useless features in the other services, like Intercom.
                </p>

                <p className="text-sm text-gray-500 mb-5">
                    Would you like to demo the chat functionality as a site visitor to test out your workspace? I&apos;ll open it in a new tab for you :D
                </p>

                <div className="flex gap-3">
                    <button onClick={handleClose} className="flex-1 px-4 py-2.5 cursor-pointer text-gray-600 bg-white/50 hover:bg-white border border-gray-400/30 rounded-xl font-medium transition disabled:opacity-50">Maybe Later</button>
                    <button onClick={() => window.open("/test/?workspace=" + localStorage.getItem('workspace')) && handleClose()} className="flex-1 px-4 py-2.5 cursor-pointer bg-black/80 hover:bg-black/90 text-white rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">Try Demo</button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">This modal won&apos;t show again after you dismiss it, choose wisely!</p>
            </div>
        </div>
    );
}

export default DemoModal;
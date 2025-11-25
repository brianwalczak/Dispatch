import { useEffect, useState } from "react";

const FADE_DURATION = 300; // ms

const Toast = ({ id, type, message, seconds = 2, onClose }) => {
    const [visible, setVisible] = useState(false);
    const [status, setStatus] = useState(null);

    // used to trigger fade in animation
    useEffect(() => {
        const id = requestAnimationFrame(() => setVisible(true));

        if(seconds) {
            const timer = setTimeout(() => setStatus(true), (seconds * 1000) + FADE_DURATION);
            
            return () => {
                clearTimeout(timer);
                cancelAnimationFrame(id);
            };
        }

        return () => cancelAnimationFrame(id);
    }, []); // on mount

    // used to trigger fade out animation and call onClose callback
    useEffect(() => {
        if(status === null) return;
        setVisible(false);
    
        if (onClose) {
            const timer = setTimeout(() => onClose(), FADE_DURATION);
                
            return () => clearTimeout(timer);
        }
    }, [status]); // on status change (triggered close)

    {/* https://flowbite.com/docs/components/toast (modified file) */}
    return (
        <div id={id} className={`toast fixed top-4 right-4 z-[9999] flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800 ${visible ? 'visible' : ''}`}>
            {type === "success" && (
                <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                    </svg>
                </div>
            )}

            {type === "warning" && (
                <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200">
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" />
                    </svg>
                </div>
            )}

            {type === "error" && (
                <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
                    </svg>
                </div>
            )}
            <div className="ms-3 text-sm font-normal">{message}</div>
        </div>
    );
};

export default Toast;
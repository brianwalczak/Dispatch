import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
    const [openFaq, setOpenFaq] = useState(null);
    const [bgLight, setBgLight] = useState(false);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        { question: "Is Dispatch free to use?", answer: "Yes! Dispatch is completely free with all the features you'll need to get started. You can create teams, manage sessions, and integrate the live chat without any cost." },
        { question: "Is Dispatch easy to integrate?", answer: "Absolutely! Dispatch provides a simple JavaScript snippet that you can add to your website in minutes." },
        { question: "Can I invite multiple team members?", answer: "Yes! Once your team is set up, you can invite as many members as you like to manage chats together." },
        { question: "Will website visitors need a Dispatch account?", answer: "No, an account is not required for users to chat with your team. However, your team members will all need their own Dispatch account to manage chats." },
        { question: "How can I trust Dispatch with my website?", answer: "We prioritize your privacy and security, and we do not share your information with third parties. Additionally, our code is fully open source under Apache 2.0. You can contribute or view it anytime on our GitHub repository page." },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const mainSection = document.querySelector("main");
            if (!mainSection) return;

            const mainBottom = mainSection.getBoundingClientRect().bottom;
            setBgLight(mainBottom < 320);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <main className="flex items-center justify-start flex-col text-center px-4 min-h-screen glow glow-orange pt-70 border-b border-gray-400/30">
                <div className="animated animatedFadeInUp fadeInUp">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">Connect with your customers <span className="flame-text">instantly</span>.</h1>
                    <p className="text-lg md:text-xl text-gray-300 mb-8">Fast, reliable live chat for your website to make customer support effortless.</p>

                    <Link to="https://app.dispatch.brian.icu/" className="md:inline-block bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow hover:bg-red-700 transition">Get Started</Link>
                    <Link to="/docs" className="md:inline-block bg-transparent text-red-500 font-semibold py-3 px-6 rounded-lg shadow border border-red-500 hover:bg-red-700 hover:text-white transition ml-3">View Docs</Link>
                </div>
            </main>

            <div id="scroller" className={`transition-colors duration-700 ${bgLight ? 'bg-[#f4f3ec]' : 'dark-bg'}`}>
            <div id="why-dispatch" className="flex flex-col items-center justify-center py-24 border-b border-gray-400/30 scroll-mt-[90px]">
                <h1 className={`text-5xl font-bold mb-12 transition-colors duration-700 ${bgLight ? 'text-black' : 'text-white'}`}>Why Dispatch?</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl w-full px-4 md:px-8">
                    <div className={`flex flex-col items-center text-center p-6 transition-colors duration-700 ${bgLight ? 'bg-white' : 'bg-gray-900'} border border-gray-400/30 rounded-lg shadow`}>
                        <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-9">
                                <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <h3 className={`text-xl font-bold mb-3 transition-colors duration-700 ${bgLight ? 'text-black' : 'text-white'}`}>Live Chat</h3>
                        <p className={`text-base transition-colors duration-700 ${bgLight ? 'text-gray-600' : 'text-gray-300'}`}>Chat with website visitors in real-time. Each team can handle multiple sessions simultaneously.</p>
                    </div>

                    <div className={`flex flex-col items-center text-center p-6 transition-colors duration-700 ${bgLight ? 'bg-white' : 'bg-gray-900'} border border-gray-400/30 rounded-lg shadow`}>
                        <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-9">
                                <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                            </svg>
                        </div>
                    
                        <h3 className={`text-xl font-bold mb-3 transition-colors duration-700 ${bgLight ? 'text-black' : 'text-white'}`}>Team Collaboration</h3>
                        <p className={`text-base transition-colors duration-700 ${bgLight ? 'text-gray-600' : 'text-gray-300'}`}>Add multiple members to your team so anyone can respond to visitors. Team chats stay organized in one place.</p>
                    </div>

                    <div className={`flex flex-col items-center text-center p-6 transition-colors duration-700 ${bgLight ? 'bg-white' : 'bg-gray-900'} border border-gray-400/30 rounded-lg shadow`}>
                        <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M14.447 3.026a.75.75 0 0 1 .527.921l-4.5 16.5a.75.75 0 0 1-1.448-.394l4.5-16.5a.75.75 0 0 1 .921-.527ZM16.72 6.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 0 1 0-1.06Zm-9.44 0a.75.75 0 0 1 0 1.06L2.56 12l4.72 4.72a.75.75 0 0 1-1.06 1.06L.97 12.53a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                            </svg>
                        </div>
                    
                        <h3 className={`text-xl font-bold mb-3 transition-colors duration-700 ${bgLight ? 'text-black' : 'text-white'}`}>Easy Integration</h3>
                        <p className={`text-base transition-colors duration-700 ${bgLight ? 'text-gray-600' : 'text-gray-300'}`}>Install Dispatch on your website with a single line of code - set up live chat instantly.</p>
                    </div>

                    <div className={`flex flex-col items-center text-center p-6 transition-colors duration-700 ${bgLight ? 'bg-white' : 'bg-gray-900'} border border-gray-400/30 rounded-lg shadow`}>
                        <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        </div>
                    
                        <h3 className={`text-xl font-bold mb-3 transition-colors duration-700 ${bgLight ? 'text-black' : 'text-white'}`}>Open Source</h3>
                        <p className={`text-base transition-colors duration-700 ${bgLight ? 'text-gray-600' : 'text-gray-300'}`}>Our code is fully open source under Apache 2.0. You can contribute or view it anytime on GitHub <a href="https://github.com/brianwalczak/dispatch" className="underline" target="_blank" rel="noopener noreferrer">here</a>.</p>
                    </div>
                </div>
            </div>

            <div id="how-it-works" className="flex flex-col items-center justify-center py-24 border-b border-gray-400/30 scroll-mt-[50px]">
                <h1 className={`text-5xl font-bold transition-colors duration-700 ${bgLight ? 'text-black' : 'text-white'} mb-16`}>Get started in seconds.</h1>

                <div className="relative flex flex-col items-center w-full max-w-3xl px-4 md:px-8">
                    <div className={`absolute top-0 bottom-0 left-1/2 w-1 transition-colors duration-700 ${bgLight ? 'bg-gray-600/20' : 'bg-gray-400/30'} -translate-x-1/2`}></div>

                    <div className={`relative flex flex-col items-center text-center p-8 transition-colors duration-700 ${bgLight ? 'bg-gray-100' : 'bg-gray-900'} border border-gray-400/30 rounded-2xl shadow-lg mb-16 w-full`}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">1</div>

                        <h3 className={`text-2xl font-semibold transition-colors duration-700 ${bgLight ? 'text-black' : 'text-white'} mb-4 mt-6`}>Add Dispatch</h3>
                        <p className={`text-base transition-colors duration-700 ${bgLight ? 'text-gray-600' : 'text-gray-300'}`}>Copy the code snippet into your website and get connected instantly.</p>
                    </div>

                    <div className={`relative flex flex-col items-center text-center p-8 transition-colors duration-700 ${bgLight ? 'bg-gray-100' : 'bg-gray-900'} border border-gray-400/30 rounded-2xl shadow-lg mb-16 w-full`}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">2</div>

                        <h3 className={`text-2xl font-semibold transition-colors duration-700 ${bgLight ? 'text-black' : 'text-white'} mb-4 mt-6`}>Set Up Your Team</h3>
                        <p className={`text-base transition-colors duration-700 ${bgLight ? 'text-gray-600' : 'text-gray-300'}`}>Follow the onboarding steps to configure your workspace and invite team members so you can reply to conversations together.</p>
                    </div>

                    <div className={`relative flex flex-col items-center text-center p-8 transition-colors duration-700 ${bgLight ? 'bg-gray-100' : 'bg-gray-900'} border border-gray-400/30 rounded-2xl shadow-lg w-full`}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">3</div>

                        <h3 className={`text-2xl font-semibold transition-colors duration-700 ${bgLight ? 'text-black' : 'text-white'} mb-4 mt-6`}>Start Chatting</h3>
                        <p className={`text-base transition-colors duration-700 ${bgLight ? 'text-gray-600' : 'text-gray-300'}`}>Begin real-time conversations with your website visitors, track each session, and provide fast, reliable support - all from your Dispatch dashboard.</p>
                    </div>
                </div>
            </div>

            <div id="faq" className="flex flex-col items-center justify-center py-24 border-b border-gray-400/30">
                <h1 className={`text-5xl font-bold transition-colors duration-700 ${bgLight ? 'text-black' : 'text-white'} mb-12`}>Frequently Asked Questions</h1>

                <div className="w-full max-w-3xl px-4 md:px-8">
                    {faqs.map((faq, index) => (
                        <div key={index} className="mb-4">
                            <button className={`flex justify-between items-center w-full p-6 transition-colors duration-700 ${bgLight ? 'bg-white hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'} border border-gray-400/30 rounded-lg shadow transition text-left`} onClick={() => toggleFaq(index)}>
                                <h3 className={`text-xl font-semibold transition-colors duration-700 ${bgLight ? 'text-gray-800' : 'text-white'}`}>{faq.question}</h3>

                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`size-6 transition-colors duration-700 ${bgLight ? 'text-red-500' : 'text-blue-500'} transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                            
                            {openFaq === index && (
                                <div className={`p-6 transition-colors duration-700 ${bgLight ? 'bg-white' : 'bg-gray-800'} border border-gray-400/30 rounded-lg mt-2`}>
                                    <p className={`text-base transition-colors duration-700 ${bgLight ? 'text-gray-800' : 'text-gray-300'}`}>{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            </div>
        </>
    );
}
import { api_url } from "../providers/config";
// ------------------------------------------------------- //
import { useState, useEffect } from "react";

function GetStarted() {
    const [status, setStatus] = useState(null);
    const [name, setName] = useState("");
    const [step, setStep] = useState(1);

    const [form, setForm] = useState(null);
    const [createStep, setCreateStep] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Values to be set after account creation
    const [token, setToken] = useState(null);
    const [workspace, setWorkspace] = useState(null);

    const handleSubmit = function (e) {
        e.preventDefault();

        if (step === 1) {
            let name = $('#name').val();
            if(name) name = name.trim();

            // Name validation
            if (!name || !name.includes(' ')) {
                return setStatus("Please provide both your first and last name.");
            } else if (name.length < 5 || name.length > 100) {
                return setStatus("Your full name must be between 5 and 100 characters long.");
            } else if (!name.match(/^[a-zA-Z\s'-]+$/)) {
                return setStatus("Your full name contains invalid characters.");
            }

            setName(name);
            return setStep(2);
        } else if (step === 2) {
            let email = $('#email').val();
            let password = $('#password').val();
            if(email) email = email.trim();

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !email.match(emailRegex) || email.length > 255) {
                return setStatus("Please provide a valid email address.");
            }

            // Password validation
            if (!password || password.length < 8 || password.length > 256) {
                return setStatus("Your password must be between 8 and 256 characters long.");
            }
        }
        
        setForm({
            url: $(e.target).attr('action'),
            method: $(e.target).attr('method'),
            data: ($(e.target).serialize() + `&name=${encodeURIComponent(name)}`) // add name to form data
        });

        return setCreateStep(1);
    };

    useEffect(() => {
        const runSteps = async () => {
            setTimeout(() => setIsCreating(true), 500);

            // Create the user account first
            if (createStep === 1) {
                try {
                    const [response] = await Promise.allSettled([
                        $.ajax(form),
                        new Promise(r => setTimeout(r, 2500)) // minimum 2.5s wait
                    ]);

                    if (response.status === "fulfilled") {
                        setToken(response.value.token);
                        setCreateStep(2);
                    } else {
                        setStatus(response.reason.responseJSON?.error || response.reason.statusText);
                    }
                } catch (error) {
                    setStatus(error.toString() || "An unknown error occurred. Please try again.");
                }
            }

            // Create the personal workspace after account creation
            if (createStep === 2) {
                try {
                    const [response] = await Promise.allSettled([
                        $.ajax({
                            url: (api_url + "/api/workspaces/new"),
                            method: "POST",
                            data: {
                                name: `${(name.split(" ")[0] + "'s") || "Personal"} Workspace`,
                                description: "This is your personal workspace where you can explore Dispatch and invite your team.",
                                token: token
                            }
                        }),
                        new Promise(r => setTimeout(r, 2500)) // minimum 2.5s wait
                    ]);

                    if (response.status === "fulfilled") {
                        setWorkspace(response.value.data.id);
                        setCreateStep(3);
                    } else {
                        setStatus(response.reason.responseJSON?.error || response.reason.statusText);
                    }
                } catch (error) {
                    setStatus(error.toString() || "An unknown error occurred. Please try again.");
                }
            }

            // Save token and workspace to localStorage
            if (createStep === 3) {
                localStorage.setItem('token', token);
                localStorage.setItem('workspace', workspace);

                setTimeout(() => setCreateStep(4), 2500);
            }

            // Final step, redirect to dashboard
            if (createStep === 4) {
                const redirect_url = params.get('redirect_url');
                const url = redirect_url ? decodeURIComponent(redirect_url) : null;

                setTimeout(() => window.location.href = (url?.startsWith('/') ? url : '/'), 2500);
            }
        };

        if (createStep) runSteps();
    }, [createStep]);

    return (
        <>
            <header className="p-4 text-black flex items-center justify-between">
                <h1 className="text-left text-2xl font-bold">Dispatch</h1>
                <a href="/auth/sign_in" className="bg-transparent text-red-500 text-base font-bold py-1.5 px-5 rounded-lg shadow border-2 border-red-500 hover:bg-red-700 hover:border-red-700 hover:text-white transition">Sign in</a>
            </header>

            {!createStep && (
                <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 mt-20">
                    <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-2 sm:mb-6">
                        {step === 1 && "Welcome. Let's get started."}
                        {step === 2 && "Almost there. Just a few more details."}
                    </h2>
                    <p className="text-center text-lg text-black sm:text-xl mb-2 sm:mb-6">
                        {step === 1 && "It's time to create your account. To get started, please provide your full name."}
                        {step === 2 && "You're almost there! Just a few more details to complete your profile."}
                    </p>

                    <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md">
                        <form action={`${api_url}/api/auth/sign_up`} method="POST" className="space-y-6" onChange={() => setStatus(null)} onSubmit={handleSubmit}>
                            {step === 1 && (
                                <div>
                                    <label htmlFor="name" className="block text-lg font-medium text-gray-900">Full Name</label>
                                    <input id="name" type="text" name="name" required autoComplete="name" className="block w-full rounded-md bg-white px-6 py-3 text-lg text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600 mt-2" />
                                </div>
                            )}

                            {step === 2 && (
                                <div>
                                    <label htmlFor="email" className="block text-lg font-medium text-gray-900">Email address</label>
                                    <input id="email" type="email" name="email" required autoComplete="email" className="block w-full rounded-md bg-white px-6 py-3 text-lg text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600 mt-2" />
                                </div>
                            )}

                            {step === 2 && (
                                <div>
                                    <label htmlFor="password" className="block text-lg font-medium text-gray-900">Password</label>
                                    <input id="password" type="password" name="password" required autoComplete="password" className="block w-full rounded-md bg-white px-6 py-3 text-lg text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600 mt-2" />
                                </div>
                            )}

                            <div>
                                <button type="submit" className="flex w-full justify-center rounded-md bg-red-600 px-6 py-3 text-lg font-bold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 cursor-pointer">
                                    {step === 1 && "Continue"}
                                    {step === 2 && "Get Started"}
                                </button>
                            </div>
                        </form>

                        <p className="mt-5 text-center text-lg text-gray-500">
                            Already a member? <a href="/auth/sign_in" className="font-semibold text-red-600 hover:text-red-500">Sign in to your dashboard</a>.
                        </p>
                        {(status && !createStep) && <div className={`mt-2 text-lg text-red-600 text-center`}>{status}</div>}
                    </div>
                </div>
            )}

            {createStep && (
                <>
                    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 mt-20 pb-3">
                        <h2 className="text-center text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-2 sm:mb-6">
                            {status && createStep ? "Whoops, something went wrong." :
                                createStep === 2 ? "Setting up your workspace..." :
                                    createStep === 3 ? "Finishing things up..." :
                                        createStep === 4 ? "Your workspace is ready!" :
                                            "Creating your account..." /* default label */
                            }
                        </h2>
                        <div className="mb-3 mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
                            <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-700 ${(status && createStep) ? 'bg-red-600' : (createStep === 4) ? 'bg-green-500' : 'bg-blue-500'}`}
                                    style={{ width: `${(status && createStep) ? '100%' : `${isCreating ? (createStep / 4) * 100 : 0}%`}` }}
                                ></div>
                            </div>
                        </div>
                        <p className={`mt-2 text-center text-lg ${(status && createStep) ? 'text-red-600' : 'text-gray-500'}`}>
                            {(status && createStep) ? status :
                                (createStep === 4) ? "You're now being redirected, please wait..." : "Don't worry, this won't take long (do not refresh the page)."}
                        </p>
                    </div>

                    {(status && createStep) && (
                        <div className="flex justify-center">
                            <a href="/auth/sign_up" className="bg-transparent text-red-500 text-base font-bold py-2 px-5 rounded-lg shadow border-2 border-red-500 hover:bg-red-700 hover:border-red-700 hover:text-white transition">Go back</a>
                        </div>
                    )}
                </>
            )}
        </>
    );
}

export default GetStarted;
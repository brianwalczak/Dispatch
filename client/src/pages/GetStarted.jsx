import { useState } from "react";

function GetStarted() {
    const [status, setStatus] = useState(null);
    const [success, setSuccess] = useState(false);
    const [name, setName] = useState("");
    const [step, setStep] = useState(1);

    const handleSubmit = function (e) {
        e.preventDefault();

        if (step === 1) {
            const name = $('#name').val();

            if (!name?.trim().includes(" ")) {
                return setStatus("Please provide both your first and last name.");
            }

            setName(name.trim());
            return setStep(2);
        }

        // add name to form data
        let formData = $(e.target).serialize();
        formData += `&name=${encodeURIComponent(name)}`;

        $.ajax({
            url: $(e.target).attr('action'),
            method: $(e.target).attr('method'),
            data: formData,
            success: function (response) {
                setSuccess(true);
                setStatus("Your account has been created. Redirecting you to your dashboard...");

                localStorage.setItem('token', response.token);
                return setTimeout(() => window.location.reload(), 1500);
            },
            error: function (xhr) {
                setSuccess(false);
                return setStatus(xhr.responseJSON?.error || xhr.statusText);
            }
        });
    };

    return (
        <>
            <header className="p-4 text-black flex items-center justify-between">
                <h1 className="text-left text-2xl font-bold">Dispatch</h1>
                <a href="/auth/sign_in" className="bg-transparent text-red-500 text-base font-bold py-1.5 px-5 rounded-lg shadow border-2 border-red-500 hover:bg-red-700 hover:border-red-700 hover:text-white transition">Sign in</a>
            </header>

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
                    <form action="http://localhost:3000/api/auth/sign_up" method="POST" className="space-y-6" onChange={() => setStatus(null)} onSubmit={handleSubmit}>
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
                    {status && <div className={`mt-2 text-lg ${success ? 'text-green-600' : 'text-red-600'} text-center`}>{status}</div>}
                </div>
            </div>
        </>
    );
}

export default GetStarted;
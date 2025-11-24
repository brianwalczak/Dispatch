import { api_url } from "../providers/config";
// ------------------------------------------------------- //
import { useEffect, useState } from "react";

function Auth_Reset() {
    const [status, setStatus] = useState(null);
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState(1);

    const handleSubmit = function (e) {
        e.preventDefault();
        
        if (step === 2) {
            const password = $('#password').val();
            const confirm_password = $('#confirm_password').val();

            if (password !== confirm_password) {
                setSuccess(false);
                return setStatus("Your passwords do not match. Please try again.");
            }
        }
        
        $.ajax({
            url: $(e.target).attr('action'),
            method: $(e.target).attr('method'),
            data: $(e.target).serialize(),
            success: function (response) {
                setSuccess(true);

                if(step === 1) {
                    setStatus("If an account with that email exists, a password reset link has been sent.");
                } else if(step === 2) {
                    setStatus("Your password has been successfully reset. Redirecting you to the login page...");
                    return setTimeout(() => window.location.href = "/auth/sign_in", 1500);
                }
            },
            error: function (xhr) {
                setSuccess(false);
                return setStatus(xhr.responseJSON?.error || xhr.statusText);
            }
        });
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token?.trim()) return setStep(2);
    }, []); // on mount, check for token parameter

    return (
        <>
            <header className="p-4 text-black flex items-center justify-between">
                <h1 className="text-left text-2xl font-bold">Dispatch</h1>
                <a href="/auth/sign_in" className="bg-transparent text-red-500 text-base font-bold py-1.5 px-5 rounded-lg shadow border-2 border-red-500 hover:bg-red-700 hover:border-red-700 hover:text-white transition">Return to Login</a>
            </header>

            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 space-y-6 mt-20">
                <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-2 sm:mb-6">
                    {step === 1 && "Forgot your password?"}
                    {step === 2 && "Enter your new password"}
                </h2>
                <p className="text-center text-lg text-black mb-2 sm:mb-6">
                    {step === 1 && "Don't worry, it happens. Enter your email address below and we'll send you a link to reset your password."}
                    {step === 2 && "Please enter your new password below. Make sure it's at least 8 characters long."}
                </p>

                <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md">
                    <form action={`${api_url}/api/auth/reset_password`} method="POST" className="space-y-6" onChange={() => setStatus(null)} onSubmit={handleSubmit}>
                        {step === 2 && (
                            <input type="hidden" name="reset_token" value={new URLSearchParams(window.location.search).get('token')} />
                        )}

                        {step === 1 && (
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

                        {step === 2 && (
                            <div>
                                <label htmlFor="confirm_password" className="block text-lg font-medium text-gray-900">Confirm Password</label>
                                <input id="confirm_password" type="password" name="confirm_password" required className="block w-full rounded-md bg-white px-6 py-3 text-lg text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600 mt-2" />
                            </div>
                        )}

                        <div>
                            <button type="submit" className="flex w-full justify-center rounded-md bg-red-600 px-6 py-3 text-lg font-bold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 cursor-pointer">
                                {step === 1 && "Send Reset Link"}
                                {step === 2 && "Reset Password"}
                            </button>
                        </div>
                    </form>

                    {status && <div className={`mt-5 text-lg ${success ? 'text-green-600' : 'text-red-600'} text-center`}>{status}</div>}
                </div>
            </div>
        </>
    );
}

export default Auth_Reset;
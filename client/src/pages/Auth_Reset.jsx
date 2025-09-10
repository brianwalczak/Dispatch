import { useEffect, useState } from "react";

function Auth_Reset() {
    const [status, setStatus] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const handleSubmit = function(e) {
            e.preventDefault();

            $.ajax({
                url: this.action,
                method: this.method,
                data: $(this).serialize(),
                success: function(response) {
                    setSuccess(true);
                    return setStatus("If an account with that email exists, a password reset link has been sent.");
                },
                error: function(xhr) {
                    setSuccess(false);
                    return setStatus(xhr.responseJSON?.error || xhr.statusText);
                }
            });
        };

        $('form').on('submit', handleSubmit);

        return () => {
            $('form').off('submit', handleSubmit);
        };
    }, []); // on mount
    

    return (
        <>
        <header className="p-4 text-black flex items-center justify-between">
            <h1 className="text-left text-2xl font-bold">Dispatch</h1>
            <a href="/auth/sign_in" className="bg-transparent text-red-500 text-base font-bold py-1.5 px-5 rounded-lg shadow border-2 border-red-500 hover:bg-red-700 hover:border-red-700 hover:text-white transition">Return to Login</a>
        </header>

        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 space-y-6 mt-20">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-2 sm:mb-6">Forgot your password?</h2>
            <p className="font-semibold text-center text-lg text-black mb-2 sm:mb-6">Don't worry, it happens. Enter your email address below and we'll send you a link to reset your password.</p>

            <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md">
                <form action="http://localhost:3000/api/auth/reset_password" method="POST" className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-lg font-medium text-gray-900">Email address</label>
                        <div className="mt-2">
                            <input id="email" type="email" name="email" required autoComplete="email" className="block w-full rounded-md bg-white px-6 py-3 text-lg text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600" />
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="flex w-full justify-center rounded-md bg-red-600 px-6 py-3 text-lg font-bold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 cursor-pointer">Send confirmation email</button>
                    </div>
                </form>

                {status && <p className={`mt-5 text-center font-medium text-lg ${success ? 'text-green-600' : 'text-red-600'}`}>{status}</p>}
            </div>
        </div>
        </>
    );
}

export default Auth_Reset;
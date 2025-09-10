import { useEffect, useState } from "react";

function Auth() {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const handleSubmit = function(e) {
            e.preventDefault();

            $.ajax({
                url: this.action,
                method: this.method,
                data: $(this).serialize(),
                success: function(response) {
                    localStorage.setItem('token', response.token);
                    return window.location.reload();
                },
                error: function(xhr) {
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
            <a href="/auth/sign_up" className="bg-transparent text-red-500 text-base font-bold py-1.5 px-5 rounded-lg shadow border-2 border-red-500 hover:bg-red-700 hover:border-red-700 hover:text-white transition">Get Started</a>
        </header>

        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <h2 className="mt-5 text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Sign in to your account</h2>

            <div className="mt-15 sm:mx-auto sm:w-full sm:max-w-md">
                <form action="http://localhost:3000/api/auth/sign_in" method="POST" className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-lg font-medium text-gray-900">Email address</label>
                        <div className="mt-2">
                            <input id="email" type="email" name="email" required autoComplete="email" className="block w-full rounded-md bg-white px-3 py-1.5 text-lg text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-lg font-medium text-gray-900">Password</label>
                            <div className="text-medium">
                                <a href="/auth/reset_password" className="font-semibold text-red-600 hover:text-red-500">Forgot password?</a>
                            </div>
                        </div>
                        <div className="mt-2">
                            <input id="password" type="password" name="password" required autoComplete="current-password" className="block w-full rounded-md bg-white px-3 py-1.5 text-lg text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600" />
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-lg font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 cursor-pointer">Sign in</button>
                    </div>
                </form>

                <p className="mt-10 text-center text-lg text-gray-500">
                    Not a member? <a href="/auth/sign_up" className="font-semibold text-red-600 hover:text-red-500">Get started for free</a>.
                    {status && <div className="mt-2 text-red-600">{status}</div>}
                </p>
            </div>
        </div>
        </>
    );
}

export default Auth;
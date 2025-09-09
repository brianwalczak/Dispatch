import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <main className="flex items-center justify-start flex-col text-center px-4 min-h-screen pt-70 border-b border-gray-400/30 glow glow-red">
            <div className="animated animatedFadeInUp fadeInUp">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">404 | Not Found</h1>
                <p className="text-lg md:text-xl text-gray-300 mb-8">
                    Whoops! The page you're looking for doesn't exist.
                </p>

                <Link to="/" className="md:inline-block bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow hover:bg-red-700 transition">Back to Home</Link>
            </div>
        </main>
    );
}
import { Link } from "react-router-dom";
import React from "react";

const Header = React.forwardRef((props, ref) => (
  <header ref={ref} className="shadow-md fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-gray-400/0 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-red-500">Dispatch</Link>
            <nav className="space-x-10 hidden md:flex">
                <Link to="/#why-dispatch" className="text-gray-300 font-bold font-medium rounded-md px-3 py-1.5 border border-transparent hover:border-gray-400/30 hover:bg-white/20 hover:text-white transition">Why Dispatch?</Link>
                <Link to="/#how-it-works" className="text-gray-300 font-bold font-medium rounded-md px-3 py-1.5 border border-transparent hover:border-gray-400/30 hover:bg-white/20 hover:text-white transition">How it Works</Link>
                <Link to="/docs" className="text-gray-300 font-bold font-medium rounded-md px-3 py-1.5 border border-transparent hover:border-gray-400/30 hover:bg-white/20 hover:text-white transition">Docs</Link>
                <Link to="/#faq" className="text-gray-300 font-bold font-medium rounded-md px-3 py-1.5 border border-transparent hover:border-gray-400/30 hover:bg-white/20 hover:text-white transition">FAQ</Link>
            </nav>

            <Link to="https://app.dispatch.brian.icu/" className="md:inline-block bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-red-700 transition">Get Started</Link>
        </div>
    </header>
));

export default Header;
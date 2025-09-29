import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import ScrollToTop from "./components/ScrollToTop";
import CustomCursor from "./components/CustomCursor";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Docs from "./pages/Docs";
import NotFound from "./pages/NotFound";
import "./index.css";

export default function App() {
    const navbar = useRef();
    const location = useLocation();
    
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 30) {
                navbar.current.classList.replace("border-gray-400/0", "border-gray-400/30");
            } else {
                navbar.current.classList.replace("border-gray-400/30", "border-gray-400/0");
            }
        };
        
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [location]);

    return (
        <>
            <CustomCursor />
            <ScrollToTop />
            <Header ref={navbar} />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/docs" element={<Docs />} />

                <Route path="*" element={<NotFound />} />
            </Routes>

            <Footer />
        </>
    );
}
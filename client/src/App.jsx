import { Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Auth from "./pages/Auth";
import GetStarted from "./pages/GetStarted";
import Auth_Reset from "./pages/Auth_Reset";
import "./index.css";

function RequireAuth({ children }) {
    const token = localStorage.getItem("token");

    return !token ? <Navigate to="/auth/sign_in" replace /> : children;
}

function RequireNoAuth({ children }) {
    const token = localStorage.getItem("token");

    return token ? <Navigate to="/" replace /> : children;
}

export default function App() {
    return (
        <>
            <ScrollToTop />

            <Routes>
                <Route path="/auth/sign_in" element={<RequireNoAuth><Auth /></RequireNoAuth>} />
                <Route path="/auth/sign_up" element={<RequireNoAuth><GetStarted /></RequireNoAuth>} />
                <Route path="/auth/reset_password" element={<RequireNoAuth><Auth_Reset /></RequireNoAuth>} />
                <Route path="/" element={<RequireAuth><p>Coming soon!</p></RequireAuth>} />
            </Routes>
        </>
    );
}
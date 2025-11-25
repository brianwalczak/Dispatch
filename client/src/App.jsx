import { useParams, useSearchParams, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Auth from "./pages/Auth";
import GetStarted from "./pages/GetStarted";
import Auth_Reset from "./pages/Auth_Reset";
import Dashboard from "./pages/Dashboard";
import Invite from "./pages/Invite";
import "./index.css";

function RequireAuth({ children }) {
    const token = localStorage.getItem("token");

    return !token ? <Navigate to="/auth/sign_in" replace /> : children;
}

function RequireNoAuth({ children }) {
    const token = localStorage.getItem("token");

    return token ? <Navigate to="/" replace /> : children;
}

function LoadDashboard() {
    const { page } = useParams();
    return <Dashboard type={page || null} />;
}

function LoadInvite() {
    const [params] = useSearchParams();
    
    const { id } = useParams();
    const token = params.get("token");
    
    if (!id || !token) {
        return <Navigate to="/" replace />;
    }
    
    return <Invite id={id} token={token} />;
}

import TestChat from "./pages/TestChat";
export default function App() {
    return (
        <>
            <ScrollToTop />

            <Routes>
                <Route path="/auth/sign_in" element={<RequireNoAuth><Auth /></RequireNoAuth>} />
                <Route path="/auth/sign_up" element={<RequireNoAuth><GetStarted /></RequireNoAuth>} />
                <Route path="/auth/reset_password" element={<RequireNoAuth><Auth_Reset /></RequireNoAuth>} />
                <Route path="/invites/:id" element={<LoadInvite />} />
                <Route path="/" element={<RequireAuth><LoadDashboard /></RequireAuth>} />
                <Route path="/:page" element={<RequireAuth><LoadDashboard /></RequireAuth>} />
                <Route path="/test" element={<TestChat />} />
            </Routes>
        </>
    );
}
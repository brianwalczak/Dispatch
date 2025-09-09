import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import "./index.css";

export default function App() {
    return (
        <>
            <ScrollToTop />

            <Routes>
                {/*<Route path="/" element={<Home />} />*/}
            </Routes>
        </>
    );
}
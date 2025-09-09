import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
    const [enabled, setEnabled] = useState(false);
    const cursor = useRef();

    useEffect(() => {
        // check if device supports mouse or trackpad
        const mq = window.matchMedia("(pointer: fine)");
        const update = () => setEnabled(mq.matches);

        update(); // on initial load
        mq.addEventListener("change", update);

        return () => mq.removeEventListener("change", update);
    }, []);

    useEffect(() => {
        if (!enabled) return;
        
        let mouseX = 0, mouseY = 0;
        let currentX = 0, currentY = 0;
        const speed = 0.2;

        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const animateCursor = () => {
            currentX += (mouseX - currentX) * speed;
            currentY += (mouseY - currentY) * speed;

            if (cursor.current) {
                cursor.current.style.transform = `translate3d(${currentX - 12}px, ${currentY - 12}px, 0)`;
            }
            
            requestAnimationFrame(animateCursor);
        };

        document.addEventListener("mousemove", handleMouseMove);
        animateCursor();

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, [enabled]);

    return enabled ? (
        <div ref={cursor} className="w-6 h-6 bg-orange-500/50 rounded-full fixed top-0 left-0 pointer-events-none z-10000"></div>
    ) : null;
}
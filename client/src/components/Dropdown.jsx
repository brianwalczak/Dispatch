import { useState, useRef, useEffect } from "react";

function Dropdown({ children, type, className, position = 'left-[52px]', method = "onClick" }) {
    const [open, setOpen] = useState(false);
    const btn = useRef();
    const menu = useRef();

    // Find .button and .menu elements from children
    let buttonChild = null;
    let menuChild = null;

    (Array.isArray(children) ? children : [children]).forEach(child => {
        if (child?.props?.className?.includes("button")) buttonChild = child;
        if (child?.props?.className?.includes("menu")) menuChild = child;
    });

    // Close dropdown if clicking outside
    useEffect(() => {
        const outClick = (event) => {
            if (menu.current && !menu.current.contains(event.target) && btn.current && !btn.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", outClick);
        return () => document.removeEventListener("mousedown", outClick);
    }, []);

    const eventProps = {
        [method]: () => setOpen(prev => !prev)
    };

    return (
        <>
            <div ref={btn} type={type} {...eventProps} className={className}>{buttonChild}</div>

            {open && (
                <div ref={menu} type={type} menu="true" className={`absolute w-52 bg-white shadow-xl rounded-xl z-50 flex flex-col p-2 ${position}`}>
                    {menuChild}
                    <button type="button" className="hidden menu-close" onClick={() => setOpen(false)} />
                </div>
            )}
        </>
    );
}

function closeMenu(type) {
    const menu = document.querySelector(`div[type="${type}"][menu="true"]`);
    menu?.querySelector("button.menu-close")?.click();
}

export { Dropdown, closeMenu };
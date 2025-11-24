const Footer = () => {
    return (
        <footer className="bg-red-500/60 py-5">
            <div className="text-center text-white text-medium">
                <p><b>&copy; {new Date().getFullYear()} Dispatch. All rights reserved.</b> | Made with <span className="text-red-500">&hearts;</span> by <a href="https://brianwalczak.com" className="underline">Brian Walczak</a>.</p>

                <p>Open source under Apache 2.0. View on <a href="https://github.com/brianwalczak/dispatch" className="underline" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
                </div>
        </footer>
    );
};

export default Footer;
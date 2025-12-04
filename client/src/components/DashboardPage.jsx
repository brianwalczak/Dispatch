import { useDashboard } from "../providers/DashboardContext";

import CreateWorkspace from "../dashboard/CreateWorkspace";
import Home from "../dashboard/Home";
import Inbox from "../dashboard/Inbox";
import Analytics from "../dashboard/Analytics";
import Team from "../dashboard/Team";
import React from "react";

const pages = {
    "create_workspace": CreateWorkspace,
    "home": Home,
    "inbox": Inbox,
    "analytics": Analytics,
    "team": Team,
};

const DEFAULT_PAGE = "home";

export default function DashboardPage({ page }) {
    const { user, loading, setLoading } = useDashboard();
    const component = pages[page] || pages[DEFAULT_PAGE];

    if (!component) {
        return (
            <div className="flex-1 overflow-hidden">
                <div className="bg-white border border-gray-300 rounded-2xl h-full">
                    <div className="flex flex-col items-center text-gray-500 justify-center h-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-22 text-gray-300 mb-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>

                        <p className="text-xl font-medium">An unknown error occurred.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-hidden">
            {loading && (
                <div className="bg-white border border-gray-300 rounded-2xl h-full">
                    <div className="flex flex-col items-center text-gray-500 justify-center h-full">
                        <div className="w-16 h-16 border-6 border-gray-300 border-t-gray-500 rounded-full animate-spin mb-3"></div>
                        <p className="text-xl font-medium">{!(user?.name) ? "Loading, this won't take long..." : `Welcome back, ${user.name.split(" ")[0]}!`}</p>
                    </div>
                </div>
            )}

            { React.createElement(component, { onLoad: () => setLoading(false) }) }
        </div>
    );
}
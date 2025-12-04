import { Dropdown, closeMenu } from "../components/Dropdown";
import { useDashboard } from "../providers/DashboardContext.jsx";
import Toast from '../components/Toast.jsx';
import { getInitials } from "../providers/utils.jsx";
import DashboardPage from "../components/DashboardPage";
import DemoModal from "../components/DemoModal";
import InviteModal from "../components/InviteModal";
import InvitePendingModal from "../components/InvitePendingModal";

function Dashboard() {
    const { page, switchPage, user, socket, members, toast, showInvite, showPending, setShowInvite, setShowPending } = useDashboard();

    return (
        <div className="bg-[#eff1ea] flex h-screen">
            {toast && <Toast {...toast} />}

            {showInvite && (
                <InviteModal onClose={() => setShowInvite(false)} />
            )}

            {showPending && (
                <InvitePendingModal onClose={() => setShowPending(false)} />
            )}

            <DemoModal />

            <div className="w-[52px] h-full bg-transparent flex flex-col items-center">
                <Dropdown type="workspaces" position="top-2 left-[52px]" className="size-10 mt-3 cursor-pointer bg-black/10 rounded-lg flex justify-center items-center text-lg mb-3 text-gray-700 font-semibold">
                    <div className="button">
                        {user && user.team ? (
                            getInitials(user.team.name || "Personal Workspace")
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="size-5">
                                <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                    <div className="menu">
                        {user?.teams?.length > 0 ? (
                            <>
                                {user.teams.map(team => (
                                    <button key={team.id} onClick={() => { closeMenu("workspaces"); if (team.id !== user.team.id) { localStorage.setItem("workspace", team.id); window.location.href = '/'; } }} className={`w-full text-left cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 ${team.id === user.team.id ? 'bg-gray-200 font-semibold' : ''}`}>
                                        {team.name}
                                    </button>
                                ))}

                                <hr className="my-2 border-gray-300" />
                            </>
                        ) : (
                            <p className="text-sm text-gray-500 text-center my-2">You have no workspaces.</p>
                        )}

                        <button onClick={() => { closeMenu("workspaces"); switchPage("create_workspace"); }} className="w-full text-left cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 font-medium text-red-600">+ Add Workspace</button>
                    </div>
                </Dropdown>

                {/* Enabled: bg-white shadow-md */}
                {/* Disabled: border border-transparent hover:bg-white/50 hover:border-gray-400/30 transition */}
                <div onClick={() => switchPage("home")} className={`size-10 mt-3 cursor-pointer flex justify-center items-center rounded-lg border border-transparent ${page === 'home' ? 'bg-white shadow-md' : 'hover:bg-white/50 hover:border-gray-400/30 transition'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                </div>

                <div onClick={() => switchPage("inbox")} className={`size-10 mt-3 cursor-pointer flex justify-center items-center rounded-lg border border-transparent ${page === 'inbox' ? 'bg-white shadow-md' : 'hover:bg-white/50 hover:border-gray-400/30 transition'}`}>
                    <svg className="size-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M6.912 3a3 3 0 0 0-2.868 2.118l-2.411 7.838a3 3 0 0 0-.133.882V18a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0 0 17.088 3H6.912Zm13.823 9.75-2.213-7.191A1.5 1.5 0 0 0 17.088 4.5H6.912a1.5 1.5 0 0 0-1.434 1.059L3.265 12.75H6.11a3 3 0 0 1 2.684 1.658l.256.513a1.5 1.5 0 0 0 1.342.829h3.218a1.5 1.5 0 0 0 1.342-.83l.256-.512a3 3 0 0 1 2.684-1.658h2.844Z" clipRule="evenodd" />
                    </svg>
                </div>

                <div onClick={() => switchPage("analytics")} className={`size-10 mt-3 cursor-pointer flex justify-center items-center rounded-lg border border-transparent ${page === 'analytics' ? 'bg-white shadow-md' : 'hover:bg-white/50 hover:border-gray-400/30 transition'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                </div>

                <div onClick={() => switchPage("team")} className={`size-10 mt-3 cursor-pointer flex justify-center items-center rounded-lg border border-transparent ${page === 'team' ? 'bg-white shadow-md' : 'hover:bg-white/50 hover:border-gray-400/30 transition'}`}>
                    <svg className="size-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
                    </svg>
                </div>

                <div className="bg-transparent mt-auto flex flex-col justify-center items-center w-full mb-4">
                    <div onClick={() => alert("Hello there! I see you came from Siege. Well, I'm unfortunately still working on this functionality and it's not quite ready yet (I didn't have enough time to finish by the end of the month).")} className={`size-10 mt-3 cursor-pointer flex justify-center items-center rounded-lg border border-transparent ${page === 'search' ? 'bg-white shadow-md' : 'hover:bg-white/50 hover:border-gray-400/30 transition'}`}>
                        <svg className="size-6 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                        </svg>
                    </div>

                    <div onClick={() => alert("Hello there! I see you came from Siege. Well, I'm unfortunately still working on this functionality and it's not quite ready yet (I didn't have enough time to finish by the end of the month).")} className={`size-10 mt-3 cursor-pointer flex justify-center items-center rounded-lg border border-transparent ${page === 'settings' ? 'bg-white shadow-md' : 'hover:bg-white/50 hover:border-gray-400/30 transition'}`}>
                        <svg className="size-6 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
                        </svg>
                    </div>

                    <Dropdown type="profile" position="bottom-2 left-[52px]" open="onMouseEnter" className="size-10 mt-4 cursor-pointer rounded-full bg-white">
                        <div className="button">
                            <svg className="w-full h-full text-black/20" xmlns="http://www.w3.org/2000/svg" viewBox="2 2 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="menu">
                            <div className="px-3 py-2">
                                <p className="font-semibold text-gray-800">{user?.name || "Unknown User"}</p>
                                <p className="text-sm text-gray-500 truncate">{user?.email || "You're logged out."}</p>
                            </div>

                            <hr className="my-2 border-gray-300" />

                            <button onClick={() => { closeMenu("profile"); switchPage("account"); }} className="cursor-pointer w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-1">
                                <svg className="w-5 h-5 text-gray-600 mt-[2px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
                                </svg>
                                <span>Account Settings</span>
                            </button>


                            <button onClick={() => { closeMenu("profile"); switchPage("workspaces"); }} className="cursor-pointer w-full min-w-max text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-1">
                                <svg className="w-5 h-5 text-gray-600 mt-[2px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5H15v-18a.75.75 0 0 0 0-1.5H3ZM6.75 19.5v-2.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 0 1.5h-.75A.75.75 0 0 1 6 6.75ZM6.75 9a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM6 12.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 6a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Zm-.75 3.75A.75.75 0 0 1 10.5 9h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 12a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM16.5 6.75v15h5.25a.75.75 0 0 0 0-1.5H21v-12a.75.75 0 0 0 0-1.5h-4.5Zm1.5 4.5a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm.75 2.25a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75h-.008ZM18 17.25a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clipRule="evenodd" />
                                </svg>

                                <span>Manage Workspaces</span>
                            </button>

                            <hr className="my-2 border-gray-300" />

                            <button onClick={() => { closeMenu("profile"); localStorage.removeItem("token"); localStorage.removeItem("workspace"); window.location.href = "/auth/sign_in"; }} className="cursor-pointer w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-1">
                                <svg className="w-5 h-5 text-gray-600 mt-[2px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red">
                                    <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z" clipRule="evenodd" />
                                </svg>
                                Sign Out
                            </button>
                        </div>
                    </Dropdown>
                </div>
            </div>

            <div className="flex-1 h-full p-2 pl-0 box-border flex flex-col">
                <div className="bg-white text-gray-600 flex items-center justify-center border border-gray-300 rounded-2xl h-12 mb-2">
                    <p><b>Team:</b> {user && user.team ? user.team.name : "No Team Selected"}</p>
                    <div className="w-px h-6 bg-gray-300 mx-4"></div>
                    <div className="flex items-center">
                        <div className={`w-2 h-2 ${socket ? 'bg-green-400' : 'bg-gray-400'} rounded-full mr-2`}></div>
                        <p>{socket ? (`${members.length} agent${members.length === 1 ? '' : 's'} connected.`) : (user && user.team ? "Connecting, please wait..." : "You are not connected.")}</p>
                    </div>
                </div>

                <DashboardPage page={page} /> {/* load the page */}
            </div>
        </div>
    );
}

export default Dashboard;
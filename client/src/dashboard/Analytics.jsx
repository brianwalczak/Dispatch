import { api_url } from "../providers/config";
// ------------------------------------------------------- //
import { useState, useEffect, useCallback } from "react";
import { useDashboard } from "../providers/DashboardContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

function Analytics({ onLoad }) {
    const { user, token, setToast } = useDashboard();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ open: 0, closed: 0 });
    const [range, setRange] = useState('7d');
    const [localTime, setLocalTime] = useState(true);

    const formatDuration = (minutes) => {
        if (minutes < 1) return '< 1m';
        if (minutes < 60) return `${Math.round(minutes)}m`;

        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const convertHours = (hourlyData) => {
        if (!hourlyData || !Array.isArray(hourlyData)) return [];
        const offset = new Date().getTimezoneOffset() / 60;
        let data = hourlyData;

        if (!localTime) { // convert to UTC (the hourly data is already in local time)
            const utcData = new Array(24).fill(0);

            hourlyData.forEach((count, localHour) => {
                const utcHour = (localHour + offset + 24) % 24;
                utcData[Math.floor(utcHour)] = count;
            });

            data = utcData;
        }

        return data.map((count, index) => {
            const period = index >= 12 ? 'PM' : 'AM';
            let displayHour = index % 12;
            if (displayHour === 0) displayHour = 12;

            return {
                hour: `${displayHour} ${period}`,
                count: count
            };
        });
    };

    const convertDaily = (timelineData) => {
        if (!timelineData || !Array.isArray(timelineData)) return [];
        const now = new Date();
        const days = timelineData.length;

        return timelineData.map((entry, index) => {
            const date = new Date(now);
            date.setDate(now.getDate() - (days - 1 - index)); // calculate index

            return {
                date: date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                }),
                total: entry.total,
                closed: entry.closed
            };
        });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <p className="font-medium text-gray-900">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const fetchAnalytics = useCallback(() => {
        if (!token || !user || !range) return;

        $.ajax({
            url: (api_url + `/api/analytics/${user.team.id}`),
            method: 'POST',
            data: { token: token, range: range, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
            success: function (response) {
                if (response.success && response.data) {
                    setStats(response.data);
                }
            },
            error: function (xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/auth/sign_in";
                } else {
                    setToast({ id: "err-toast", type: "error", message: "An internal error occurred. Please try again later.", onClose: () => setToast(null) });
                }
            },
        });
    }, [token, user, range, setToast]);

    useEffect(() => {
        if (!token || !user) return;

        fetchAnalytics();

        setLoading(false);
        if (onLoad) onLoad();
    }, [token, user, range]); // don't need to include fetchAnalytics since it already redefines on token/user change :]

    if (loading) return null;
    return (
        <div className="flex flex-col w-full h-full justify-start gap-2">
            <div className="flex items-center justify-between p-6 bg-white border border-gray-300 rounded-2xl">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Analytics</h1>
                    <p className="text-gray-500">Track your team&apos;s performance and resolution metrics.</p>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => setRange("24h")} className={`cursor-pointer px-4 py-2 ${range === "24h" ? "bg-black/80 hover:bg-black/90 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"} rounded-xl text-sm font-medium transition`}>
                        24 Hours
                    </button>

                    <button onClick={() => setRange("7d")} className={`cursor-pointer px-4 py-2 ${range === "7d" ? "bg-black/80 hover:bg-black/90 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"} rounded-xl text-sm font-medium transition`}>
                        7 Days
                    </button>

                    <button onClick={() => setRange("30d")} className={`cursor-pointer px-4 py-2 ${range === "30d" ? "bg-black/80 hover:bg-black/90 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"} rounded-xl text-sm font-medium transition`}>
                        30 Days
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2"> {/* 4 columns of stuff, gap of 2 like everything else */}
                <div className="bg-white border border-gray-300 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Total Conversations</p>
                            <p className="text-3xl text-gray-900 font-bold">{stats?.totals?.total || 0}</p>
                        </div>

                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 text-blue-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                            </svg>
                        </div>
                    </div>

                    {stats?.comparison && (
                        <p className={`text-xs ${stats.comparison >= 0 ? 'text-green-600' : 'text-red-600'} font-medium mt-2`}>
                            {stats.comparison >= 0 ? '▲' : '▼'} {Math.abs(stats.comparison)}% vs previous period
                        </p>
                    )}
                </div>

                <div className="bg-white border border-gray-300 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Unresolved</p>
                            <p className="text-3xl text-gray-900 font-bold">{stats?.totals?.open || 0}</p>
                        </div>

                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 text-yellow-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                            </svg>
                        </div>
                    </div>

                    <p className="text-xs text-yellow-600 font-medium mt-2">
                        {stats?.totals?.open > 0 ? `${stats.totals.open} need${stats.totals.open === 1 ? 's' : ''} attention` : 'All caught up!'}
                    </p>
                </div>

                <div className="bg-white border border-gray-300 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Resolved</p>
                            <p className="text-3xl text-gray-900 font-bold">{stats?.totals?.closed || 0}</p>
                        </div>

                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-7 text-green-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                    </div>

                    <p className="text-xs text-green-600 font-medium mt-2">
                        {stats?.totals?.total > 0 ? `${Math.round((stats.totals.closed / stats.totals.total) * 100)}% resolution rate` : 'No resolutions yet'}
                    </p>
                </div>

                <div className="bg-white border border-gray-300 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Avg. Resolution Time</p>
                            <p className="text-3xl text-gray-900 font-bold">{formatDuration(stats?.avgResolutionTime || 0)}</p>
                        </div>

                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6 text-purple-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <p className="text-xs text-purple-600 font-medium mt-2">
                        {stats?.avgResolutionTime ? 'From open to closed' : 'No resolutions yet'}
                    </p>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-[2fr_1fr] gap-2 min-h-0"> {/* 2 columns, but one is 2/3 width and other is 1/3 cause its noicer */}
                <div className="flex flex-col overflow-hidden bg-white border border-gray-300 rounded-2xl p-5">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">Conversations Over Time</h3>
                        <p className="text-sm text-gray-500">Daily conversation volume</p>
                    </div>

                    <div className="flex-1 min-h-0">
                        {/* chart created with generative AI (not sure how to use recharts well) */}
                        {stats?.timeline?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={convertDaily(stats.timeline)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2b7fff" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2b7fff" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00c951" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00c951" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="total" name="Total" stroke="#2b7fff" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="closed" name="Resolved" stroke="#00c951" fillOpacity={1} fill="url(#colorClosed)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <p>No data available for this period.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col overflow-hidden bg-white border border-gray-300 rounded-2xl p-5">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">Status Overview</h3>
                        <p className="text-sm text-gray-500">Open vs resolved conversations</p>
                    </div>

                    <div className="flex-1 min-h-0">
                        {/* chart created with generative AI (not sure how to use recharts well) */}
                        {stats?.totals?.total > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Open', value: stats.totals.open },
                                            { name: 'Resolved', value: stats.totals.closed }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#fbbf24" />
                                        <Cell fill="#10b981" />
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-gray-400 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 mx-auto mb-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                                </svg>
                                <p>No data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 gap-2 min-h-0"> {/* 1 large column */}
                <div className="flex flex-col overflow-hidden bg-white border border-gray-300 rounded-2xl p-5">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Hourly Activity</h3>
                            <p className="text-sm text-gray-500">When your customers are most active</p>
                        </div>

                        <button onClick={() => setLocalTime(!localTime)} className="cursor-pointer px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg text-xs font-medium transition flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {localTime ? 'Local Time' : 'UTC'}
                        </button>
                    </div>

                    <div className="flex-1 min-h-0">
                        {/* chart created with generative AI (not sure how to use recharts well) */}
                        {stats?.hourly?.some(h => h > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={convertHours(stats.hourly)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Conversations" fill="#2b7fff" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <p>No data available for this period.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
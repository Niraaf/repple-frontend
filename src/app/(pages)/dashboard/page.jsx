"use client";

import { useAuth } from "@/contexts/authContext";

export default function Dashboard() {
    const { currentUser } = useAuth();

    return (
        <div className="w-full min-h-screen px-6 py-20 flex flex-col gap-10">
            {/* 🧭 Header */}
            <header className="max-w-7xl w-full mx-auto">
                <h1 className="text-5xl font-extrabold text-gray-800 mb-1">Dashboard</h1>
                <p className="text-gray-500 text-md">Welcome back! Time to crush another workout!</p>
            </header>

            {/* 📊 Main Grid Layout */}
            <main className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
                {/* ⛓️ Primary Panels */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DashboardCard
                        title="📅 Next Workout"
                        description="No routine scheduled. Let’s plan your next session."
                        accent="from-blue-300 to-purple-300"
                    />
                    <DashboardCard
                        title="🚀 Quick Start"
                        description="Jump into your next routine."
                        accent="from-green-300 to-lime-200"
                    />
                    <DashboardCard
                        title="⭐ Favorite Routines"
                        description="Pin your top 3 workouts for quick access."
                        accent="from-yellow-200 to-orange-300"
                    />
                    <DashboardCard
                        title="🛠️ Workout Builder"
                        description="Design and customize a new training routine."
                        accent="from-pink-300 to-red-200"
                    />
                </section>

                {/* 📈 Stat Sidebar */}
                <aside className="flex flex-col gap-5">
                    <StatsPanel title="📈 This Week">
                        <Stat label="Workouts" value="0" />
                        <Stat label="Minutes Logged" value="0" />
                        <Stat label="Total Sets" value="0" />
                    </StatsPanel>

                    <StatsPanel title="📆 Lifetime Stats">
                        <Stat label="Total Workouts" value="0" />
                        <Stat label="Time Trained" value="0h" />
                        <Stat label="Personal Records" value="0" />
                    </StatsPanel>

                    <StatsPanel title="👤 Account">
                        <Stat
                            label="Status"
                            value={currentUser?.isAnonymous ? "Guest" : "Logged In"}
                        />
                        <Stat label="UID" value={currentUser?.uid.slice(0, 6) + "..."} />
                    </StatsPanel>
                </aside>
            </main>
        </div>
    );
}

// 🧱 Reusable Dashboard Card
function DashboardCard({ title, description, accent }) {
    return (
        <div className="relative group p-6 bg-white/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-md hover:shadow-lg transition-all overflow-hidden">
            <div
                className={`absolute inset-0 opacity-20 group-hover:opacity-30 transition duration-500 bg-gradient-to-br ${accent}`}
            ></div>
            <div className="relative z-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">{title}</h2>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
    );
}

// 📊 Stats Wrapper
function StatsPanel({ title, children }) {
    return (
        <div className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-md p-5">
            <h3 className="text-md font-semibold text-gray-800 mb-3">{title}</h3>
            <div className="divide-y divide-gray-300/30">{children}</div>
        </div>
    );
}

// Individual Stat Row
function Stat({ label, value }) {
    return (
        <div className="flex justify-between py-2 text-sm text-gray-700">
            <span>{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}

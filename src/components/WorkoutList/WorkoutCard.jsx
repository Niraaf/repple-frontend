"use client";

const formatLastPerformed = (dateStr) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (date.getTime() >= today.getTime()) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
};

export default function WorkoutCard({ workout, onView, onQuickStart }) {
    const handleQuickStartClick = (e) => {
        e.stopPropagation();
        onQuickStart(workout.id);
    };

    return (
        <div
            onClick={() => onView(workout.id)}
            className="w-full max-w-3xl backdrop-blur-md rounded-xl px-6 py-4 shadow-md hover:shadow-lg transition cursor-pointer flex justify-between items-center bg-white/30 hover:bg-white/50 border-4 border-b-0 border-white/30"
        >
            <div className="flex flex-col w-[80%]">
                <h2 className="text-sm md:text-lg font-bold truncate">{workout.name}</h2>
                <p className="text-xs md:text-sm text-gray-400">
                    {`${workout.exercise_count || 0} Exercises • ~${workout.estimated_duration_minutes || 0} min`}
                </p>
                <p className="text-xs md:text-sm text-gray-500 font-bold">
                    Last performed: {formatLastPerformed(workout.last_performed)}
                </p>
            </div>

            <button
                onClick={handleQuickStartClick}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 
                     text-white font-bold px-5 py-3 rounded-full shadow-md transition cursor-pointer"
                title="Quick Start"
            >
                ▶
            </button>
        </div>
    );
}
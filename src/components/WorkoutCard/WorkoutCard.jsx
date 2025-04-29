"use client";

export default function WorkoutCard({ workout, idx, onView }) {
    const formatLastPerformed = (dateStr) => {
        if (!dateStr) return "Never";
        const date = new Date(dateStr);
        const diffDays = Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        return `${diffDays} days ago`;
    };

    return (
        <div
            onClick={() => onView(workout.id)}
            className="w-full max-w-3xl bg-white/30 backdrop-blur-md rounded-xl px-6 py-4 shadow-md hover:shadow-lg transition cursor-pointer flex justify-between items-center"
        >
            <div className="flex flex-col w-[80%]">
                <h2 className="text-sm md:text-lg font-bold truncate">{workout.name}</h2>
                <p className="text-xs md:text-sm text-gray-400">{`${workout.num_exercises} Exercises • ~${workout.estimated_duration} min`}</p>
                <p className="text-xs md:text-sm  text-gray-500 font-bold">Last: {formatLastPerformed(workout.last_performed)}</p>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/workouts/${workout.id}/train`;
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow transition text-sm shrink-0 flex items-center justify-center"
                title="Quick Start"
            >
                ▶️
            </button>
        </div>
    );
}

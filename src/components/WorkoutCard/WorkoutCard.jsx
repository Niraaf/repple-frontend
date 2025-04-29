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
            className={`w-64 bg-white/20 backdrop-blur-xl rounded-2xl 
                        shadow-lg hover:shadow-2xl hover:scale-105 transition transform cursor-pointer 
                        relative overflow-hidden`}
        >
            {/* ▶️ Quick Play Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/workouts/${workout.id}/train`;
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute bottom-4 right-4 bg-green-500 hover:bg-green-600 hover:scale-105 
                           text-white p-2 rounded-full shadow-lg transition pointer-events-auto z-10 cursor-pointer"
                title="Quick Start"
            >
                ▶️
            </button>

            {/* Content */}
            <div className="relative p-5 pb-12">
                <h2 className="text-lg font-bold truncate">{workout.name}</h2>
                <p className="text-sm text-gray-400 mt-2">{`${workout.num_exercises} Exercises • ~${workout.estimated_duration} min`}</p>
                <p className="text-xs text-gray-500 mt-1">Last: {formatLastPerformed(workout.last_performed)}</p>
            </div>
        </div>
    );
}

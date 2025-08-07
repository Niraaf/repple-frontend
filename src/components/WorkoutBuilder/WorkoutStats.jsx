'use client';

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

export default function WorkoutStats({ workout }) {
    return (
        <div className="flex justify-center items-center gap-4 text-xs text-gray-500 mb-2 rounded-full">
            <span>💪 {workout.exercise_count || 0} Exercises</span>
            <span>•</span>
            <span>⏱️ ~{workout.estimated_duration_minutes || 0} min</span>
            <span>•</span>
            <span>🗓️ Last performed: {formatLastPerformed(workout.last_performed)}</span>
        </div>
    );
};
"use client";

import React, { useEffect, useState } from "react";
export default function WorkoutView({ workoutId }) {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [workoutDetails, setWorkoutDetails] = useState({
        workoutName: "Untitled Workout",
        num_exercises: 0,
        estimated_duration: 0,
        last_performed: null
    });

    useEffect(() => {
        const fetchWorkoutData = async () => {
            try {
                const res = await fetch(`/api/workout/${workoutId}/exercises`);
                const data = await res.json();

                setExercises(data.exercises);
                setWorkoutDetails({
                    workoutName: data.workout_name,
                    num_exercises: data.num_exercises,
                    estimated_duration: data.estimated_duration,
                    last_performed: data.last_performed
                });
            } catch (err) {
                console.error("Failed to fetch workout data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkoutData();
    }, [workoutId]);

    if (loading) return <div className="text-center mt-10">Loading workout...</div>;

    const sortedExercises = exercises.sort((a, b) => a.sequence - b.sequence);

    const formatLastPerformed = (dateStr) => {
        if (!dateStr) return "Never";
        const date = new Date(dateStr);
        const diffDays = Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        return `${diffDays} days ago`;
    };

    const handleStart = () => {
        window.location.href = `/workouts/${workoutId}/start`
    }

    const handleEdit = () => {
        window.location.href = `/workouts/${workoutId}/edit`
    }

    return (
        <div className="p-10 m-10 mt-30 max-w-5xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm relative">

            {/* 🏷️ Quest Header */}
            <div className="mb-8 text-center">
                <h1 className="text-5xl font-extrabold tracking-tight text-gray-800">
                    🎮 {workoutDetails.workoutName}
                </h1>
                <p className="mt-3 text-sm text-gray-500 italic">
                    ⏳ {workoutDetails.estimated_duration} mins • 🗡️ {workoutDetails.num_exercises} Tasks • 🕒 Last: {formatLastPerformed(workoutDetails.last_performed)}
                </p>
            </div>

            {/* 🎮 Action Buttons */}
            <div className="flex justify-center gap-4 mb-12">
                <button
                    onClick={handleStart}
                    className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm"
                >
                    🚀 Start Quest
                </button>
            </div>

            <button
                onClick={handleEdit}
                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-purple-100 text-purple-600 rounded-full transition shadow-sm"
                title="Edit Quest"
            >
                ✏️
            </button>


            {/* 📜 Quest Tasks */}
            <div className="space-y-6">
                {sortedExercises.map((ex, idx) => (
                    <React.Fragment key={ex.id}>
                        {/* Exercise Block */}
                        <div className="flex items-start gap-4 p-5 border border-gray-200 rounded-xl hover:shadow-md transition bg-neutral-50">
                            <div className="flex items-center justify-center bg-purple-200 text-purple-700 font-bold w-10 h-10 rounded-full">
                                {idx + 1}
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg text-gray-800 mb-1">⚔️ {ex.name}</h2>
                                <p className="text-sm text-gray-600 mb-1">🎯 {ex.focus} | 🏋️ {ex.type}</p>
                                <p className="text-sm text-gray-500">📦 {ex.sets} Sets • {ex.reps} Reps • ⏱️ {ex.rest_between_sets}s Rest (between sets)</p>
                            </div>
                        </div>

                        {/* Rest Between Exercises */}
                        {idx < sortedExercises.length - 1 && (
                            <div className="flex justify-center">
                                <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-full shadow-sm">
                                    🌿 Rest Between Exercise: {ex.rest_between_exercise}s
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

        </div>
    );

}

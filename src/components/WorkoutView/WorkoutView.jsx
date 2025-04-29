"use client";

import React, { useEffect, useState } from "react";
import DeleteModal from "../DeleteModal/DeleteModal";
export default function WorkoutView({ workoutId }) {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [workoutDetails, setWorkoutDetails] = useState({
        workoutName: "Untitled Workout",
        num_exercises: 0,
        estimated_duration: 0,
        last_performed: null
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const fetchWorkoutData = async () => {
            try {
                const res = await fetch(`/api/workout/${workoutId}/workout-details`);
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

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const res = await fetch(`/api/workout/${workoutId}/delete`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert("Workout deleted successfully!");
                window.location.href = "/workouts"; // Redirect
            } else {
                const errorData = await res.json();
                alert(`Failed to delete workout: ${errorData.message}`);
            }
        } catch (err) {
            console.error("Error deleting workout:", err);
            alert("An unexpected error occurred.");
        } finally {
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen p-10 pt-30">

            {loading && <p className="text-gray-400 animate-pulse">Loading your workout details...</p>}

            {!loading &&
                <div className="flex flex-col w-full h-full max-w-5xl">
                    {/* 🏷️ Quest Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-5xl font-extrabold tracking-tight text-gray-800">
                            {workoutDetails.workoutName}
                        </h1>
                        <p className="mt-3 text-sm text-gray-500 italic">
                            ⏳ {workoutDetails.estimated_duration} mins • 🗡️ {workoutDetails.num_exercises} Tasks • 🕒 Last: {formatLastPerformed(workoutDetails.last_performed)}
                        </p>
                    </div>

                    {/* 🎮 Action Buttons */}
                    <div className="flex justify-between items-center mb-8 flex-wrap gap-2">
                        {/* Left: Start Button */}
                        <div>
                            {exercises.length > 0 &&
                                <button
                                    onClick={handleStart}
                                    className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 
                                    text-white font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer"
                                >
                                    🚀 Start
                                </button>
                            }
                        </div>

                        {/* Right: Edit / Delete */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleDelete}
                                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition shadow-sm cursor-pointer"
                                title="Delete Workout"
                            >
                                🗑️
                            </button>
                            <button
                                onClick={handleEdit}
                                className="p-2 bg-gray-100 hover:bg-purple-100 text-purple-600 rounded-full transition shadow-sm cursor-pointer"
                                title="Edit Workout"
                            >
                                ✏️
                            </button>
                        </div>
                    </div>

                    {/* Exercises */}
                    <div className="space-y-6">
                        {sortedExercises.map((ex, idx) => (
                            <React.Fragment key={ex.id}>
                                {/* Exercise Block */}
                                <div className="flex items-start gap-4 p-4 rounded-xl shadow-md hover:shadow-lg transition bg-white/30 hover:bg-white/50 border-4 border-b-0 border-white/30">
                                    <div className="flex shrink-0 items-center justify-center bg-purple-200 text-purple-700 font-bold text-xs w-6 h-6 rounded-full">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-lg text-gray-800 mb-1">⚔️ {ex.name}</h2>
                                        <div className="flex flex-wrap gap-1 my-1">
                                            {ex.muscle_groups.map(group => (
                                                <span key={group} className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">
                                                    {group}
                                                </span>
                                            ))}
                                            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">
                                                {ex.equipment}
                                            </span>
                                            <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full">
                                                {ex.type}
                                            </span>
                                            <span className="bg-pink-100 text-pink-700 text-[10px] px-2 py-0.5 rounded-full">
                                                {ex.focus}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">{ex.sets} Sets • {ex.reps} Reps • ⏱️ {ex.rest_between_sets}s Rest (between sets)</p>
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
            }

            {/* Delete Modal Pop Up */}
            {showDeleteModal && (
                <DeleteModal
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

        </div>
    );

}

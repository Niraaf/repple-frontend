"use client";

import React, { useEffect, useState } from "react";
import DeleteModal from "../DeleteModal/DeleteModal";
import { useGetWorkout } from "@/hooks/useGetWorkout";
import { useRouter } from "next/navigation";
import { useDeleteWorkout } from "@/hooks/useDeleteWorkout";

export default function WorkoutView({ workoutId }) {
    const router = useRouter();
    const [exercises, setExercises] = useState([]);
    const [workoutDetails, setWorkoutDetails] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data, isPending: isLoading, isError } = useGetWorkout(workoutId);

    const deleteMutation = useDeleteWorkout();

    useEffect(() => {
        if (data?.exercises) {
            setExercises(data.exercises);
            setWorkoutDetails({
                workoutName: data.workout_name,
                num_exercises: data.num_exercises,
                estimated_duration: data.estimated_duration,
                last_performed: data.last_performed
            });
        }
    }, [data]);

    const sortedExercises = exercises.sort((a, b) => a.sequence - b.sequence);

    const formatLastPerformed = (dateStr) => {
        if (!dateStr) return "Never";
        const date = new Date(dateStr);
        const diffDays = Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        return `${diffDays} days ago`;
    };

    const handleStart = () => router.push(`/workouts/${workoutId}/train`);
    const handleEdit = () => router.push(`/workouts/${workoutId}/edit`);
    const handleDelete = () => setShowDeleteModal(true);

    const confirmDelete = async () => {
        try {
            await deleteMutation.mutateAsync(workoutId);
            alert("Workout deleted successfully!");
            router.push("/workouts");
        } catch (err) {
            console.error("Error deleting workout:", err);
            alert(`Failed to delete workout: ${err.message}`);
        } finally {
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full min-h-screen p-10 pt-30">

            {isLoading && <p className="text-gray-400 animate-pulse">Loading your workout details...</p>}

            {!isLoading && !isError &&
                <div className="flex flex-col w-full h-full max-w-5xl">
                    {/* 🏷️ Workout Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800">
                            {workoutDetails?.workoutName || "Untitled Workout"}
                        </h1>
                        <p className="mt-3 text-sm text-gray-500 italic">
                            ⏳ {workoutDetails?.estimated_duration || 0} mins • 🗡️ {workoutDetails?.num_exercises || 0} Tasks • 🕒 Last: {formatLastPerformed(workoutDetails.last_performed)}
                        </p>
                    </div>

                    {/* Action Buttons */}
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
                                <div className="flex items-start gap-4 p-4 rounded-xl shadow-md hover:shadow-lg transition bg-white/30 hover:bg-white/50 border-4 border-b-0 border-white/30 relative">
                                    <div className="absolute -top-2 -left-2 bg-purple-200 text-purple-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-sm">
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
                                        <p className="text-sm text-gray-500">{ex.sets} Sets • {ex.reps} Reps • {ex.rest_between_sets}s Rest Between Sets</p>
                                    </div>
                                </div>

                                {/* Rest Between Exercises */}
                                {idx < sortedExercises.length - 1 && (
                                    <div className="flex justify-center">
                                        <div
                                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition bg-white/30 hover:bg-white/50 border-4 border-b-0 border-white/30 relative"
                                        >
                                            {ex.rest_between_exercise}s Rest
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
"use client";

import { useUserWorkouts } from "@/hooks/useUserWorkouts";
import WorkoutCard from "../WorkoutCard/WorkoutCard";
import { useRouter } from "next/navigation";

export default function WorkoutList() {
    const router = useRouter();

    const {
        data: workouts,
        isPending: isLoading,
        isError,
        refetch,
    } = useUserWorkouts();

    const handleClick = (id) => {
        router.push(`/workouts/${id}`);
    };

    const handleCreate = () => {
        router.push('/workouts/create');
    };

    return (
        <div className="flex flex-col items-center gap-6 min-h-screen p-6 pt-30 w-full">
            {/* 🚀 Title */}
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                    Choose your Workout
                </h1>
                <p className="text-gray-400 text-xs md:text-sm">Select a workout to view and start your session!</p>
            </div>

            {/* Loading */}
            {isLoading && <p className="text-lg text-gray-400 animate-pulse">Loading your workouts...</p>}

            {/* No Workouts */}
            {isError && (
                <p className="text-red-500 text-center text-lg">
                    You don't have any workouts yet. Create one!
                </p>
            )}

            {/* Workout List */}
            {!isLoading && !isError && workouts.length > 0 && (
                <div className="flex flex-col gap-4 w-full max-w-3xl">
                    {workouts.map((workout, idx) => (
                        <WorkoutCard
                            key={workout.id}
                            workout={workout}
                            idx={idx}
                            onView={handleClick}
                        />
                    ))}
                </div>
            )}

            {/* Create Button */}
            {!isLoading && (
                <button
                    className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 
                     text-white font-bold py-3 px-8 rounded-full shadow-md transition cursor-pointer"
                    onClick={handleCreate}
                >
                    + Create New Workout
                </button>
            )}
        </div>
    );
}

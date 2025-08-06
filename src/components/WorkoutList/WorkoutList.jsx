"use client";

import { useUserWorkouts } from "@/hooks/useWorkouts";
import WorkoutCard from "../WorkoutCard/WorkoutCard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";

export default function WorkoutList() {
    const router = useRouter();
    const { userProfile } = useAuth();
    const { data: workouts, isLoading, isError } = useUserWorkouts(userProfile?.firebase_uid);

    const handleCreate = () => {
        router.push('/workouts/new');
    };

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-lg text-gray-400 animate-pulse">Loading your workouts...</p>;
        }
        if (isError) {
            return <p className="text-red-500 text-center text-lg">Could not load workouts. Please try again later.</p>;
        }
        if (workouts && workouts.length > 0) {
            return (
                <div className="flex flex-col gap-4 w-full max-w-3xl">
                    {workouts.map((workout) => (
                        <WorkoutCard
                            key={workout.id}
                            workout={workout}
                        />
                    ))}
                </div>
            );
        }
        return <p className="text-gray-500 text-center text-lg">You haven't created any workouts yet.</p>;
    };

    return (
        <div className="flex flex-col items-center gap-6 min-h-screen p-6 pt-30 w-full">
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                    My Workouts
                </h1>
                <p className="text-gray-400 text-xs md:text-sm">Select a workout to view, edit, or start a session.</p>
            </div>

            {renderContent()}

            <button
                className="mt-6 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 
                         text-white font-bold py-3 px-8 rounded-full shadow-md transition cursor-pointer"
                onClick={handleCreate}
            >
                + Create New Workout
            </button>
        </div>
    );
}
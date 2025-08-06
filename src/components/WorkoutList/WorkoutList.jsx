"use client";

import { useUserWorkouts } from "@/hooks/useWorkouts";
import { useCreateSession } from "@/hooks/useSession";
import WorkoutCard from "./WorkoutCard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import { useAlertModal } from "@/hooks/useAlertModal";

export default function WorkoutList() {
    const router = useRouter();
    const { userProfile } = useAuth();
    const { showAlert, AlertModalComponent } = useAlertModal();
    const { data: workouts, isLoading, isError } = useUserWorkouts(userProfile?.firebase_uid);
    const { mutateAsync: createSession, isPending: isStartingSession } = useCreateSession();

    const handleCreate = () => {
        router.push('/workouts/new');
    };

    const handleViewWorkout = (workoutId) => {
        router.push(`/workouts/${workoutId}`);
    };

    const handleQuickStart = async (workoutId) => {
        if (isStartingSession || !userProfile) return;
        try {
            const newSession = await createSession({
                workoutId: workoutId,
                firebaseUid: userProfile.firebase_uid
            });
            router.push(`/session/${newSession.id}`);
        } catch (error) {
            console.error("Failed to start session:", error);
            showAlert({
                title: "Error",
                message: "Could not start the workout session. Please try again."
            });
        }
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
                            onView={handleViewWorkout}
                            onQuickStart={handleQuickStart}
                        />
                    ))}
                </div>
            );
        }
        return <p className="text-gray-500 text-center text-lg">You haven't created any workouts yet.</p>;
    };

    return (
        <div className="flex flex-col items-center gap-6 min-h-screen p-6 pt-24 md:pt-32 w-full">
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                    My Workouts
                </h1>
                <p className="text-gray-400 text-xs md:text-sm">Select a workout to view, edit, or start a session.</p>
            </div>

            {renderContent()}

            <button
                className="mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 
                         text-white font-bold py-3 px-8 rounded-full shadow-md transition cursor-pointer"
                onClick={handleCreate}
            >
                + Create New Workout
            </button>

            {/* Render the alert modal component (it's invisible until called) */}
            { AlertModalComponent }
        </div>
    );
}
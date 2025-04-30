import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";

const getSupabaseUserId = async (firebaseUid) => {
    const res = await fetch(`/api/user/map-firebase?firebaseUid=${firebaseUid}`);
    const data = await res.json();
    return data.userId;
};

const saveWorkout = async ({ workoutId, currentUser, workoutName, exercises }) => {
    if (!currentUser) throw new Error("No user");

    const supabaseUserId = await getSupabaseUserId(currentUser.uid);
    let savedWorkoutId = workoutId;

    // If no ID, create new workout first
    if (!workoutId) {
        const res = await fetch("/api/workout/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: supabaseUserId,
                name: workoutName || "Untitled Workout",
                exercises,
            }),
        });
        const data = await res.json();
        savedWorkoutId = data.workoutId;
    }

    // Save exercises
    await fetch(`/api/workout/${savedWorkoutId}/save-exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutName: workoutName || "Untitled Workout", exercises }),
    });

    return savedWorkoutId;
};

export function useSaveWorkout() {
    const queryClient = useQueryClient();
    const currentUser = useAuth();

    return useMutation({
        mutationFn: ({ workoutId, workoutName, exercises }) =>
            saveWorkout({ workoutId, currentUser, workoutName, exercises }),
        onSuccess: (savedWorkoutId) => {
            queryClient.invalidateQueries({ queryKey: ["user-workouts"] });
            queryClient.invalidateQueries({ queryKey: ["workout-details", savedWorkoutId] });
        },
        onError: (err) => {
            console.error("Error saving workout:", err);
        },
    });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authContext";

const getSupabaseUserId = async (firebaseUid) => {
    console.log("firebase", firebaseUid);
    const res = await fetch(`/api/users/map-firebase?firebaseUid=${firebaseUid}`);
    const data = await res.json();
    return data.userId;
};

const saveWorkout = async ({ workoutId, currentUser, workoutName, exercises }) => {
  if (!currentUser) throw new Error("No user");

  const supabaseUserId = await getSupabaseUserId(currentUser.uid);

  let url = "/api/workout";
  let method = "POST";

  if (workoutId) {
    url = `/api/workout/${workoutId}`;
    method = "PUT";
  }

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: supabaseUserId,
      workoutName: workoutName || "Untitled Workout",
      exercises,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to save workout");
  }

  const data = await res.json();
  return data.workoutId || workoutId;
};

export function useSaveWorkout() {
    const queryClient = useQueryClient();
    const { currentUser } = useAuth();

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

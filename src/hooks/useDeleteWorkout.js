import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workoutId) => {
      const res = await fetch(`/api/workout/${workoutId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete workout");
      }
    },
    onSuccess: (_, deletedWorkoutId) => {
      queryClient.invalidateQueries({ queryKey: ["user-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["workout-details", deletedWorkoutId] });
    },
    onError: (err) => {
            console.error("Error deleting workout:", err);
    },
  });
};
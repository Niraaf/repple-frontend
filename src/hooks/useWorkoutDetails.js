import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authContext";

const fetchWorkoutDetails = async (workoutId) => {
    const res = await fetch(`/api/workout/${workoutId}/workout-details`);
    if (!res.ok) throw new Error("Failed to fetch workout details");
    return res.json();
};

export function useWorkoutDetails(workoutId) {
    const { currentUser } = useAuth();

    return useQuery({
        queryKey: ["workout-details", workoutId],
        queryFn: () => fetchWorkoutDetails(workoutId),
        enabled: !!workoutId && !!currentUser,
        staleTime: 1000 * 60 * 5,
    });
}

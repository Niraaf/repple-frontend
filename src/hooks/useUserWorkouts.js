import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authContext";

const getSupabaseUserId = async (firebaseUid) => {
    const res = await fetch(`/api/user/map-firebase?firebaseUid=${firebaseUid}`);
    const data = await res.json();
    return data.userId;
};

const fetchUserWorkouts = async (firebaseUid) => {
    const supabaseUserId = await getSupabaseUserId(firebaseUid);
    const res = await fetch(`/api/user/user-workouts?userId=${supabaseUserId}`);
    if (!res.ok) throw new Error("Failed to fetch workouts");
    return res.json();
};

export function useUserWorkouts() {
    const { currentUser } = useAuth();

    return useQuery({
        queryKey: ["user-workouts", currentUser?.uid],
        queryFn: () => fetchUserWorkouts(currentUser.uid),
        enabled: !!currentUser,
        staleTime: 1000 * 60* 5,
    });
}

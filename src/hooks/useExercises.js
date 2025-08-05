import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';

/**
 * API service function to fetch exercises.
 * It intelligently includes the user's ID in the request if they are logged in.
 */
const fetchExercises = async (currentUser) => {
    let url = '/api/exercises';

    // If a user is logged in, add their UID as a query parameter
    if (currentUser) {
        url += `?firebaseUid=${currentUser.uid}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch exercises');
    }
    return res.json();
};

/**
 * Custom hook to fetch the exercise library.
 * The data returned will be different for guests vs. logged-in users.
 */
export const useExercises = () => {
    const { currentUser } = useAuth();

    return useQuery({
        // The queryKey changes when the user logs in or out, triggering a refetch.
        queryKey: ['exercises', currentUser?.uid || 'guest'],
        queryFn: () => fetchExercises(currentUser),
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });
};
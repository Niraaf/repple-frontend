import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { createSupabaseBrowserClient } from '@/supabase/supabaseClient';

const supabase = createSupabaseBrowserClient();

/**
 * API service function to fetch exercises.
 * It now securely sends the user's ID Token in the Authorization header.
 */
const fetchExercises = async () => {
    const headers = { 'Content-Type': 'application/json' };
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const res = await fetch('/api/exercises', { headers });
    if (!res.ok) {
        throw new Error('Failed to fetch exercises');
    }
    return res.json();
};

/**
 * Custom hook to fetch the exercise library.
 * The data returned will be different for guests vs. logged-in users,
 * and React Query handles this automatically thanks to the dynamic queryKey.
 */
export const useExercises = () => {
    const { userProfile, userLoading } = useAuth();

    return useQuery({
        queryKey: ['exercises', userProfile?.id || 'guest'],
        queryFn: fetchExercises,
        staleTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: false,
        enabled: !userLoading,
    });
};
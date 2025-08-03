import { useQuery } from '@tanstack/react-query';

// This function performs the actual API call.
const fetchExerciseLibrary = async () => {
    const res = await fetch('/api/exercises/library'); 
    if (!res.ok) {
        throw new Error('Failed to fetch exercise library');
    }
    return res.json();
};

export const useExerciseLibrary = () => {
    return useQuery({
        queryKey: ['exercise-library'], // Unique key for this data in the cache
        queryFn: fetchExerciseLibrary,
        staleTime: 1000 * 60 * 60, // Cache this data for 1 hour, it doesn't change often
    });
};
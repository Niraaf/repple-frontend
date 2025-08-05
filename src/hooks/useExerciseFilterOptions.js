import { useQuery } from '@tanstack/react-query';

const fetchFilterOptions = async () => {
    const res = await fetch('/api/filters/exercises');
    if (!res.ok) {
        throw new Error('Failed to fetch exercise filter options');
    }
    return res.json();
};

/**
 * Custom hook to fetch the available filter options (muscles, equipment, etc.) for the exercise library.
 */
export const useExerciseFilterOptions = () => {
    return useQuery({
        queryKey: ['exercise-filter-options'], // More descriptive query key
        queryFn: fetchFilterOptions,
        staleTime: 1000 * 60 * 60, // Cache for 1 hour
    });
};
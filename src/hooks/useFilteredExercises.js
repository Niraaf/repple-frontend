import { useState, useMemo } from 'react';

/**
 * A hook to manage filter state and return a memoized list of filtered exercises.
 * @param {Array} exerciseLibrary - The full, unfiltered array of exercises.
 */
export const useFilteredExercises = (exerciseLibrary = []) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilters, setActiveFilters] = useState({});

    const handleFilterChange = (categoryKey, optionName) => {
        setActiveFilters(prev => {
            const currentSelection = prev[categoryKey] || [];
            const newSelection = currentSelection.includes(optionName)
                ? currentSelection.filter(item => item !== optionName)
                : [...currentSelection, optionName];
            return { ...prev, [categoryKey]: newSelection };
        });
    };

    const filteredExercises = useMemo(() => {
        // Return the full library if it's not ready yet
        if (!exerciseLibrary || exerciseLibrary.length === 0) return [];

        return exerciseLibrary.filter(exercise => {
            const searchLower = searchQuery.toLowerCase();
            const searchMatch = searchQuery.length === 0 ||
                exercise.name.toLowerCase().includes(searchLower) ||
                exercise.description?.toLowerCase().includes(searchLower);

            if (!searchMatch) return false;

            return Object.entries(activeFilters).every(([categoryKey, selectedOptions]) => {
                if (!selectedOptions || selectedOptions.length === 0) return true;

                return selectedOptions.some(optionName =>
                    exercise[categoryKey]?.some(tag => tag.name === optionName)
                );
            });
        });
    }, [searchQuery, activeFilters, exerciseLibrary]);

    return {
        searchQuery,
        setSearchQuery,
        activeFilters,
        handleFilterChange,
        filteredExercises,
    };
};
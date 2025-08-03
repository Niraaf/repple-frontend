import { useState, useMemo } from 'react';

export const useExerciseFilter = (exerciseLibrary = []) => {
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
    
    // useMemo ensures this complex filtering logic only re-runs when needed.
    const filteredExercises = useMemo(() => {
        return exerciseLibrary.filter(exercise => {
            // 1. Filter by search query (name or description)
            const searchLower = searchQuery.toLowerCase();
            const searchMatch = searchQuery.length === 0 ||
                exercise.name.toLowerCase().includes(searchLower) ||
                exercise.description?.toLowerCase().includes(searchLower);
            
            if (!searchMatch) return false;

            // 2. Apply multi-select filters (AND between categories, OR within a category)
            return Object.entries(activeFilters).every(([categoryKey, selectedOptions]) => {
                if (!selectedOptions || selectedOptions.length === 0) return true;

                // The exercise must have at least ONE of the selected options for this category (OR logic)
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
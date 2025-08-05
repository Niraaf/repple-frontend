import React from 'react';
import { useExercises } from '@/hooks/useExercises';
import { useExerciseFilterOptions } from '@/hooks/useExerciseFilterOptions'; // <-- New Name
import { useFilteredExercises } from '@/hooks/useFilteredExercises'; // <-- New Name
import FilterControls from './FilterControls';
import ExerciseList from './ExerciseList';

export default function ExerciseModal({ onClose, onAddExercise, addedExerciseIds }) {
    // Fetch the two distinct types of data with their own hooks.
    const { data: exercises, isLoading: isLoadingExercises, isError: isExercisesError } = useExercises();
    const { data: filterOptions, isLoading: isLoadingFilters, isError: isFiltersError } = useExerciseFilterOptions();

    const {
        searchQuery,
        setSearchQuery,
        activeFilters,
        handleFilterChange,
        filteredExercises
    } = useFilteredExercises(exercises); // No need for '|| []' if the hook handles it.

    // Combine loading and error states.
    const isLoading = isLoadingExercises || isLoadingFilters;
    const isError = isExercisesError || isFiltersError;

    // Helper function to render the content based on the data fetching state
    const renderContent = () => {
        if (isLoading) {
            return <p className="text-gray-500 animate-pulse mt-8">Loading Library...</p>;
        }

        if (isError) {
            return <p className="text-red-500 mt-8">Error: Could not load the exercise library. Please try again.</p>;
        }
        
        return (
            <>
                <FilterControls
                    filterOptions={filterOptions}
                    activeFilters={activeFilters}
                    handleFilterChange={handleFilterChange}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
                
                {/* future button for adding custom exercises */}

                <ExerciseList
                    exercises={filteredExercises}
                    onAddExercise={onAddExercise}
                    addedExerciseIds={addedExerciseIds}
                />
            </>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm" onClick={onClose}>
            <div className="flex flex-col items-center bg-white/50 border-4 border-b-0 border-white/30 rounded-3xl shadow-2xl p-8 relative w-[90%] max-w-5xl h-[90%] animate-fade-in" onClick={(e) => e.stopPropagation()}>
                
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-2xl cursor-pointer">✖️</button>
                <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800">Select Your Exercise</h2>
                
                {renderContent()}

            </div>
        </div>
    );
};
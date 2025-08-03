// src/components/ExerciseModal/ExerciseModal.jsx
import React from 'react';
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary';
import { useExerciseFilter } from '@/hooks/useExerciseFilter';
import FilterControls from './FilterControls';
import ExerciseList from './ExerciseList';

export default function ExerciseModal({ onClose, onAddExercise, addedExerciseIds }) {
    // 1. Fetch the library data. isLoading will be true until the fetch is complete.
    const { data: libraryData, isLoading, isError } = useExerciseLibrary();

    // 2. Prepare the filter logic. We pass an empty array as a fallback
    //    to ensure the hook doesn't break during the initial loading render.
    const { 
        searchQuery, 
        setSearchQuery, 
        activeFilters, 
        handleFilterChange, 
        filteredExercises 
    } = useExerciseFilter(libraryData?.exercises || []);

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
                    filterOptions={libraryData.filters}
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
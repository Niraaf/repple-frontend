'use client';

export default function CurrentStepDisplay({
    playerState,
    workoutName,
    currentStep,
    nextStep,
    currentSetNumber,
    totalSteps,
    currentStepNumber
}) {
    // A helper to determine what text to show in the sub-header
    const renderSubHeader = () => {
        // Guard against rendering before data is ready
        if (!currentStep) return null;

        const exerciseDetails = currentStep.exercise;
        const isTimed = exerciseDetails?.mechanics?.some(m => m.name.includes('Isometric') || m.name.includes('Stretching'));

        switch (playerState) {
            case 'resting':
                // If the current step is a dedicated REST block, show what's next.
                if (currentStep.step_type === 'REST' && nextStep?.exercise?.name) {
                    return <p className="mt-2 text-lg text-gray-600 font-medium">Next Up: {nextStep.exercise.name}</p>;
                }
                // Otherwise, it's an intra-set rest.
                return <p className="mt-2 text-lg text-gray-600 font-medium">Next Up: {currentStep?.exercise.name} Set {currentSetNumber} of {currentStep.target_sets}</p>;

            case 'active_set':
                if (!exerciseDetails) return null;
                // For timed exercises, show the duration. For others, show the sets.
                return (
                    <p className="mt-2 text-lg text-gray-700 font-medium">
                        {exerciseDetails.name} – Set {currentSetNumber} of {currentStep.target_sets}
                        {isTimed && ` – Hold for ${currentStep.target_duration_seconds}s`}
                    </p>
                )

            default:
                // Don't show anything for 'ready' or 'logging' states
                return null;
        }
    };

    return (
        <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-800">
                {workoutName || 'Workout Session'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
                {/* Show the step count, but not if the workout is finished */}
                {playerState !== 'finished' && `Step ${currentStepNumber} of ${totalSteps}`}
            </p>
            <div className="h-8 mt-2">
                {renderSubHeader()}
            </div>
        </div>
    );
}
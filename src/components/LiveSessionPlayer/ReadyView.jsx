"use client";

export const ReadyView = ({ sessionData, currentStep, currentStepNumber, currentSetNumber, advanceState }) => {
    const isResuming = currentStepNumber !== 1 || currentSetNumber !== 1;
    const readyMessage = `${isResuming ? `Next up: ${currentStep?.exercise?.name} - Set ${currentSetNumber} of ${currentStep?.target_sets}` : `First up: ${currentStep?.exercise?.name}`}`;
    return (
        <div className="flex flex-col items-center justify-center text-center w-full min-h-screen p-6">
            <h1 className="text-xl">{`You are about to ${isResuming ? 'resume' : 'start'}`}</h1>
            <h2 className="text-4xl font-extrabold tracking-tight my-2">
                {sessionData?.workout?.name || 'Workout'}
            </h2>
            <p className="mt-2 text-lg font-medium mb-12">{readyMessage}</p>
            <button
                onClick={() => advanceState({ type: 'BEGIN_WORKOUT' })}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition transform hover:scale-105 cursor-pointer"
            >
                {`${isResuming ? 'RESUME' : 'BEGIN'} WORKOUT`}
            </button>
        </div>
    );
}
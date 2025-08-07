"use client";

export const ReadyView = ({ sessionData, currentStep, advanceState }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center w-full min-h-screen p-6">
            <h1 className="text-xl text-gray-500">You are about to begin:</h1>
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-800 mt-2 mb-4">
                {sessionData?.workout?.name || 'Workout'}
            </h2>
            <p className="mt-2 text-lg text-blue-600 font-medium mb-8">First up: {currentStep?.exercise?.name}</p>
            <button
                onClick={() => advanceState({ type: 'BEGIN_WORKOUT' })}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition transform hover:scale-105"
            >
                BEGIN WORKOUT
            </button>
        </div>
    );
}
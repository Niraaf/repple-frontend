'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/authContext';
import { useUnitPreference } from '@/contexts/unitPreferenceContext';

export default function SetCompletionScreen({ step, nextStep, currentSetNumber, measuredDuration, onLogSet }) {
    const { userProfile } = useAuth();
    const { convertToKg, displayUnit } = useUnitPreference();

    const exercise = step.exercise;
    const isStretch = exercise.mechanics?.some(m => m.name.includes('Stretching'));
    const isLastSet = currentSetNumber >= step.target_sets;
    const showNextUpForStretch = isStretch && !isLastSet;

    const isTimed = exercise.mechanics?.some(m => m.name.includes('Isometric') || m.name.includes('Stretching'));
    const isBodyweight = exercise.equipments?.some(e => e.name === 'Bodyweight');

    const initialReps = String(step.target_reps).split('-')[0].replace(/\D/g, '') || '8';
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState(step.target_reps === "AMRAP" ? '' : initialReps);

    const handleSubmit = (e) => {
        e.preventDefault();

        const weightValue = parseFloat(weight || 0);
        const weightInKg = convertToKg(weightValue);

        onLogSet({
            weight_kg: isBodyweight ? 0 : weightInKg,
            reps_completed: isTimed ? 1 : reps,
            duration_seconds: measuredDuration,
        });
    };

    const inputClasses = "w-24 text-center text-lg font-semibold py-2 border border-gray-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-purple-400 focus:outline-none transition";
    const labelClasses = "text-md font-medium text-gray-700";
    const buttonText = `Log Set & ${isLastSet && !nextStep ? 'Finish Workout' : showNextUpForStretch ? 'Start Next Set' : 'Start Rest'}`;

    return (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex justify-center items-center p-4">
            <div
                className="bg-white/50 border-4 border-b-0 border-white/30 p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-sm animate-fade-in backdrop-blur-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="font-extrabold text-xl text-center text-gray-800 tracking-tight">{exercise.name}</h3>
                <p className="text-center text-sm text-gray-500 mb-6">Set Complete ({measuredDuration}s)</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isTimed ? (
                        <p className="text-center text-sm text-gray-600 italic py-8">
                            Your hold time has been recorded.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {!isBodyweight && (
                                <div className='flex justify-between items-center'>
                                    <label htmlFor="weightInput" className={labelClasses}>Weight ({displayUnit}):</label>
                                    <input
                                        id="weightInput"
                                        type="text"
                                        inputMode="decimal"
                                        pattern="[0-9]*[.]?[0-9]*"
                                        value={weight}
                                        placeholder="0"
                                        onChange={e => setWeight(e.target.value.replace(/[^0-9.]/g, ''))}
                                        autoFocus
                                        className={inputClasses}
                                    />
                                </div>
                            )}
                            <div className='flex justify-between items-center'>
                                <label htmlFor="repsInput" className={labelClasses}>Reps:</label>
                                <input
                                    id="repsInput"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={reps}
                                    placeholder="reps"
                                    onChange={e => setReps(e.target.value.replace(/[^0-9]/g, ''))}
                                    className={inputClasses}
                                />
                            </div>
                        </div>
                    )}

                    {showNextUpForStretch && (
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-500">NEXT UP</p>
                            <p className="font-semibold text-gray-600">{nextStep?.exercise?.name || exercise.name} - Set {currentSetNumber + 1}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-3xl shadow-lg transition transform hover:scale-105 cursor-pointer"
                    >
                        {buttonText}
                    </button>
                </form>
            </div>
        </div>
    );
}
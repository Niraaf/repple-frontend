'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import { useSessionDetails, useLogSet, useLogRest, useFinishSession } from "@/hooks/useSession";
import { useBlobTheme } from "@/hooks/useBlobTheme";
import Link from 'next/link';

import CurrentStepDisplay from "@/components/LiveSessionPlayer/CurrentStepDisplay";
import PlayerControls from "@/components/LiveSessionPlayer/PlayerControls";
import { useTimer } from '@/hooks/useTimer';
import PlayerTimer from '@/components/LiveSessionPlayer/PlayerTimer';
import SetCompletionScreen from '@/components/LiveSessionPlayer/SetCompletionScreen';

const ErrorDisplay = ({ message }) => (
    <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
        <p className="text-gray-500">{message}</p>
    </div>
);

export default function LiveSessionPlayerPage() {
    const router = useRouter();
    const params = useParams();
    const { sessionId } = params;
    const { userProfile } = useAuth();

    const [playerState, setPlayerState] = useState('ready');
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [currentSetNumber, setCurrentSetNumber] = useState(1);

    const { data: sessionData, isLoading, isError, error } = useSessionDetails(sessionId, userProfile?.firebase_uid, {
        enabled: router.isReady && !!sessionId && !!userProfile,
    });

    const { mutate: logSet } = useLogSet();
    const { mutate: logRest } = useLogRest();
    const { mutate: finishSession } = useFinishSession();

    const timer = useTimer();
    useBlobTheme(playerState);

    const steps = sessionData?.workout?.workout_steps;
    const currentStep = useMemo(() => steps?.[currentStepIndex], [steps, currentStepIndex]);
    const isCurrentStepTimed = useMemo(() =>
        currentStep?.exercise?.mechanics?.some(m => m.name.includes('Isometric') || m.name.includes('Stretching')),
        [currentStep]
    );

    const nextStep = useMemo(() => steps?.[currentStepIndex + 1], [steps, currentStepIndex]);
    const workoutName = sessionData?.workout?.name;
    const totalSteps = steps?.length || 0;
    const currentStepNumber = currentStepIndex + 1;

    // This is the "Engine" that handles state transitions
    const advanceState = (action) => {
        if (!currentStep) return;

        switch (playerState) {
            case 'ready':
                if (action.type === 'BEGIN_WORKOUT') {
                    setPlayerState('active_set');
                    if (isCurrentStepTimed) {
                        timer.start(currentStep.target_duration_seconds);
                    } else {
                        timer.start();
                    }
                }
                break;
            case 'active_set':
                if (action.type === 'FINISH_SET') {
                    timer.pause();
                    setPlayerState('logging');
                }
                break;
            case 'logging':
                if (action.type === 'LOG_SET') {
                    logSet({
                        setData: {
                            session_id: sessionId,
                            exercise_id: currentStep.exercise_id,
                            set_number: currentSetNumber,
                            ...action.payload,
                        },
                        firebaseUid: userProfile.firebase_uid,
                    });

                    const isLastSet = currentSetNumber >= currentStep.target_sets;
                    const isCurrentStepStretch = currentStep.exercise?.mechanics?.some(m => m.name.includes('Stretching'));
                    let nextState;

                    if (isLastSet) {
                        if (!nextStep) {
                            nextState = 'finished';
                            timer.reset();
                            // Check if it has an ended_at time to prevent re-finishing
                            if (!sessionData?.ended_at) {
                                finishSession({ sessionId, firebaseUid: userProfile.firebase_uid });
                            }
                        } else {
                            setCurrentStepIndex(prev => prev + 1);
                            setCurrentSetNumber(1);
                            if (nextStep.step_type === 'REST') {
                                nextState = 'resting';
                                timer.start(nextStep.target_duration_seconds);
                            } else {
                                nextState = 'active_set';
                                const isNextStepTimed = nextStep?.exercise?.mechanics?.some(m => m.name.includes('Isometric') || m.name.includes('Stretching'));
                                if (isNextStepTimed) {
                                    timer.start(nextStep.target_duration_seconds);
                                } else {
                                    timer.start();
                                }
                            }
                        }
                    } else {
                        setCurrentSetNumber(prev => prev + 1);
                        nextState = isCurrentStepStretch ? 'active_set' : 'resting';
                        if (nextState === 'resting') {
                            const isIntraSetRest = currentStep.step_type === 'EXERCISE';
                            const restDuration = isIntraSetRest
                                ? currentStep.target_intra_set_rest_seconds
                                : currentStep.target_duration_seconds;
                            timer.start(restDuration);
                        } else if (nextState === 'active_set') {
                            if (isCurrentStepTimed) timer.start(currentStep.target_duration_seconds);
                            else timer.start();
                        }
                    }

                    setPlayerState(nextState);
                }
                break;
            case 'resting':
                if (action.type === 'FINISH_REST') {
                    const isIntraSetRest = currentStep.step_type === 'EXERCISE';

                    const restTarget = isIntraSetRest
                        ? currentStep.target_intra_set_rest_seconds
                        : currentStep.target_duration_seconds;

                    const actual_duration = Math.round(
                        timer.seconds < 0
                            ? restTarget + Math.abs(timer.seconds)
                            : restTarget - timer.seconds
                    );

                    logRest({
                        restData: { session_id: sessionId, target_duration_seconds: restTarget, actual_duration_seconds: actual_duration },
                        firebaseUid: userProfile.firebase_uid
                    });


                    if (currentStep.step_type === 'REST') {
                        setCurrentStepIndex(prev => prev + 1);
                        setCurrentSetNumber(1);
                        const isNextStepTimed = nextStep?.exercise?.mechanics?.some(m => m.name.includes('Isometric') || m.name.includes('Stretching'));
                        if (isNextStepTimed) {
                            timer.start(nextStep.target_duration_seconds);
                        } else {
                            timer.start();
                        }
                    } else {
                        if (isCurrentStepTimed) {
                            timer.start(currentStep.target_duration_seconds);
                        } else {
                            timer.start();
                        }
                    }

                    setPlayerState('active_set');
                }
                break;
            default:
                break;
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen text-lg text-gray-500 animate-pulse">Preparing your session...</div>;
    }

    if (isError) {
        return <div className="flex justify-center items-center h-screen"><ErrorDisplay message={error.message} /></div>;
    }

    if (playerState === 'ready') {
        return (
            <div className="flex flex-col items-center justify-center text-center w-full min-h-screen p-6">
                <h1 className="text-xl text-gray-500">You are about to begin:</h1>
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-800 mt-2 mb-8">
                    {sessionData?.workout?.name || 'Workout'}
                </h2>
                <button
                    onClick={() => advanceState({ type: 'BEGIN_WORKOUT' })}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition transform hover:scale-105"
                >
                    BEGIN WORKOUT
                </button>
            </div>
        );
    }

    if (playerState === 'finished') {
        return (
            <div className="flex flex-col items-center justify-center text-center w-full min-h-screen p-6">
                <h1 className="text-4xl font-extrabold text-green-600 animate-pulse">Workout Complete!</h1>
                <p className="mt-4 text-gray-500">Amazing job. Your session has been saved.</p>
                <Link
                    href={`/history/${sessionId}`}
                    className="mt-8 bg-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-purple-700 transition"
                >
                    View Session Summary
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full min-h-screen pt-30">
            <CurrentStepDisplay
                playerState={playerState}
                workoutName={workoutName}
                currentStep={currentStep}
                nextStep={nextStep}
                currentSetNumber={currentSetNumber}
                totalSteps={totalSteps}
                currentStepNumber={currentStepNumber}
            />

            {/* The Timer will go here in the next step */}
            <PlayerTimer
                seconds={timer.seconds}
                isResting={playerState === 'resting'}
            />

            <PlayerControls
                playerState={playerState}
                onAdvanceState={advanceState}
            />

            {playerState === 'logging' && (
                <SetCompletionScreen
                    step={currentStep}
                    nextStep={nextStep}
                    currentSetNumber={currentSetNumber}
                    measuredDuration={
                        isCurrentStepTimed
                            ? Math.round(timer.seconds < 0
                                ? currentStep.target_duration_seconds + Math.abs(timer.seconds)
                                : currentStep.target_duration_seconds - timer.seconds)
                            : Math.round(timer.seconds)
                    }
                    onLogSet={(setData) => advanceState({ type: 'LOG_SET', payload: setData })}
                />
            )}
        </div>
    );
}
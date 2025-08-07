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
import { ReadyView } from './ReadyView';
import { FinishedView } from './FinishedView';

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

    const [player, setPlayer] = useState({
        state: 'ready',
        stepIndex: 0,
        setNumber: 1,
    });

    const [seconds, setSeconds] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);

    const { data: sessionData, isLoading, isError, error } = useSessionDetails(sessionId, {
        enabled: router.isReady && !!sessionId && !!userProfile,
    });

    const { mutate: logSet } = useLogSet();
    const { mutate: logRest } = useLogRest();
    const { mutate: finishSession } = useFinishSession();

    const timer = useTimer({ isActive: isTimerActive, setSeconds, setIsActive: setIsTimerActive });
    useBlobTheme(player.state);

    const steps = useMemo(() => sessionData?.workout?.workout_steps || [], [sessionData]);
    const currentStep = useMemo(() => steps[player.stepIndex], [steps, player.stepIndex]);
    const nextStep = useMemo(() => steps[player.stepIndex + 1], [steps, player.stepIndex]);

    const advanceState = (action) => {
        const currentStepForTransition = steps[player.stepIndex];
        if (!currentStepForTransition && player.state !== 'ready') {
            setPlayer(prev => ({ ...prev, state: 'finished' }));
            return;
        };

        switch (player.state) {
            case 'ready':
                if (action.type === 'BEGIN_WORKOUT') setPlayer({ ...player, state: 'active_set' });
                break;

            case 'active_set':
                if (action.type === 'FINISH_SET') setPlayer({ ...player, state: 'logging' });
                break;

            case 'logging':
                if (action.type === 'LOG_SET') {
                    logSet({
                        session_id: sessionId,
                        exercise_id: currentStepForTransition.exercise_id,
                        set_number: player.setNumber,
                        duration_seconds: Math.round(timer.seconds),
                        ...action.payload,
                    });

                    const isLastSet = player.setNumber >= currentStepForTransition.target_sets;
                    const isStretch = currentStepForTransition.exercise?.mechanics?.some(m => m.name.includes('Stretching'));

                    if (isLastSet) {
                        const nextStepInLine = steps[player.stepIndex + 1];
                        if (!nextStepInLine) {
                            setPlayer({ ...player, state: 'finished' });
                        } else {
                            setPlayer({
                                state: nextStepInLine.step_type === 'REST' ? 'resting' : 'active_set',
                                stepIndex: player.stepIndex + 1,
                                setNumber: 1,
                            });
                        }
                    } else {
                        setPlayer({
                            state: isStretch ? 'active_set' : 'resting',
                            stepIndex: player.stepIndex,
                            setNumber: player.setNumber + 1,
                        });
                    }
                }
                break;

            case 'resting':
                if (action.type === 'FINISH_REST') {
                    const isIntraSetRest = currentStep.step_type === 'EXERCISE';
                    const restTarget = isIntraSetRest ? currentStep.target_intra_set_rest_seconds : currentStep.target_duration_seconds;
                    const actual_duration = Math.round(timer.seconds < 0 ? restTarget + Math.abs(timer.seconds) : restTarget - timer.seconds);

                    logRest({
                        session_id: sessionId,
                        target_duration_seconds: restTarget,
                        actual_duration_seconds: actual_duration
                    });

                    if (currentStepForTransition.step_type === 'REST') {
                        setPlayer({
                            state: 'active_set',
                            stepIndex: player.stepIndex + 1,
                            setNumber: 1,
                        });
                    } else {
                        setPlayer({ ...player, state: 'active_set' });
                    }
                }
                break;

            default:
                break;
        }
    };

    useEffect(() => {
        if (!currentStep) return;
        const isTimed = currentStep.exercise?.mechanics?.some(m => m.name.includes('Isometric') || m.name.includes('Stretching'));

        timer.reset();
        if (player.state === 'active_set') {
            if (isTimed) timer.start(currentStep.target_duration_seconds);
            else timer.start();
        } else if (player.state === 'resting') {
            const isIntraSetRest = currentStep.step_type === 'EXERCISE';
            const restDuration = isIntraSetRest ? currentStep.target_intra_set_rest_seconds : currentStep.target_duration_seconds;
            timer.start(restDuration);
        } else if (player.state === 'logging') {
            timer.pause();
        } else if (player.state === 'finished' && !sessionData?.ended_at) {
            finishSession(sessionId);
        }
    }, [player.state, currentStep]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen text-lg text-gray-500 animate-pulse">Preparing your session...</div>;
    }

    if (isError) {
        return <div className="flex justify-center items-center h-screen"><ErrorDisplay message={error.message} /></div>;
    }

    if (player.state === 'ready') {
        return <ReadyView
            sessionData={sessionData}
            currentStep={currentStep}
            advanceState={advanceState}
        />;
    }

    if (player.state === 'finished') {
        return <FinishedView sessionId={sessionId} />;
    }

    return (
        <div className="flex flex-col items-center w-full min-h-screen pt-30">
            <CurrentStepDisplay
                playerState={player.state}
                workoutName={sessionData?.workout?.name}
                currentStep={currentStep}
                nextStep={nextStep}
                currentSetNumber={player.setNumber}
                totalSteps={steps.length}
                currentStepNumber={player.stepIndex + 1}
            />

            <PlayerTimer seconds={seconds} isResting={player.state === 'resting'} />
            <PlayerControls playerState={player.state} onAdvanceState={advanceState} />

            {player.state === 'logging' && (
                <SetCompletionScreen
                    step={currentStep}
                    nextStep={nextStep}
                    currentSetNumber={player.setNumber}
                    measuredDuration={
                        currentStep.exercise?.mechanics?.some(m => m.name.includes('Isometric') || m.name.includes('Stretching'))
                            ? Math.round(seconds < 0
                                ? currentStep.target_duration_seconds + Math.abs(seconds)
                                : currentStep.target_duration_seconds - seconds)
                            : Math.round(seconds)
                    }
                    onLogSet={(setData) => advanceState({ type: 'LOG_SET', payload: setData })}
                />
            )}
        </div>
    );
}
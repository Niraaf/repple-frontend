'use client';

import { useMemo } from 'react';
import { useUnitPreference } from '@/contexts/unitPreferenceContext';

// A small, reusable component for displaying a single statistic.
const StatCard = ({ label, value, unit }) => (
    <div className="bg-white/40 p-4 rounded-lg shadow-sm text-center">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800">
            {value} <span className="text-sm font-normal">{unit}</span>
        </p>
    </div>
);

// A badge to highlight Personal Records (Not implemented)
const PRBadge = () => (
    <span className="ml-2 px-2 py-0.5 bg-yellow-300 text-yellow-800 text-xs font-bold rounded-full">
        PR
    </span>
);

// A component to render individual log entries
const LogEntry = ({ item }) => {
    return (
        <div className={`p-4 rounded-lg ${item.isSet ? 'bg-white/50' : 'bg-blue-100/50'}`}>
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.subtext}</p>
                </div>
                <div className="text-right font-semibold text-gray-700">
                    {item.performance}
                </div>
            </div>
        </div>
    );
};

export default function SessionSummary({ sessionData }) {
    const {
        session_id,
        workout_name,
        workout_plan: plan,
        logged_sets,
        logged_rests,
        started_at,
        total_paused_seconds,
        active_time_seconds,
        total_volume,
        total_reps,
        total_sets,
        workout_type
    } = sessionData;

    const date = new Date(started_at);
    const { displayUnit, convertWeight } = useUnitPreference();

    const displayLog = useMemo(() => {
        const log = [];
        if (!plan?.workout_steps) return [];

        let remainingSets = [...logged_sets].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const remainingRests = [...logged_rests].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        let restIndex = 0;

        plan.workout_steps.forEach(step => {
            if (step.step_type === 'EXERCISE') {
                const isStretch = step.exercise?.mechanics?.some(m => m.name === 'Stretching');
                const isBodyweight = step.exercise?.equipments?.some(e => e.name === 'Bodyweight');
                const isAmrap = step.target_reps === 'AMRAP';

                const setsForThisStep = [];
                const nextRemainingSets = [];
                let hasStartedCollecting = false;

                for (const set of remainingSets) {
                    if (set.exercise_id === step.exercise_id) {
                        if (hasStartedCollecting && set.set_number === 1) {
                            nextRemainingSets.push(set);
                            continue;
                        }

                        setsForThisStep.push(set);
                        hasStartedCollecting = true;
                    } else {
                        nextRemainingSets.push(set); 
                    }
                }

                remainingSets = nextRemainingSets;

                setsForThisStep.forEach(loggedSet => {
                    let performance = '';
                    if (isStretch || step.exercise?.mechanics?.some(m => m.name === 'Isometric')) {
                        performance = `${loggedSet.duration_seconds}s hold`;
                    } else {
                        const weightString = isBodyweight ? 'Bodyweight' : `${convertWeight(loggedSet.weight_kg)} ${displayUnit}`;
                        const amrapTag = isAmrap ? ' (AMRAP)' : '';
                        performance = `${loggedSet.reps_completed} reps @ ${weightString}${amrapTag}`;
                    }

                    log.push({
                        uniqueKey: `set-${loggedSet.id}`,
                        isSet: true,
                        name: step.exercise.name,
                        subtext: `Set ${loggedSet.set_number}`,
                        performance: performance
                    });

                    const isLastSet = loggedSet.set_number >= step.target_sets;
                    if (!isLastSet && !isStretch) {
                        if (restIndex < remainingRests.length) {
                            const intraSetRest = remainingRests[restIndex];
                            log.push({
                                uniqueKey: `rest-${intraSetRest.id}`,
                                isSet: false,
                                name: 'Rest',
                                subtext: `Target: ${intraSetRest.target_duration_seconds}s`,
                                performance: `${intraSetRest.actual_duration_seconds}s`
                            });
                            restIndex++;
                        }
                    }
                });
            } else if (step.step_type === 'REST') {
                if (restIndex < remainingRests.length) {
                    const restBlock = remainingRests[restIndex];
                    log.push({
                        uniqueKey: `rest-${restBlock.id}`,
                        isSet: false,
                        name: 'Rest Block',
                        subtext: `Target: ${restBlock.target_duration_seconds}s`,
                        performance: `${restBlock.actual_duration_seconds}s`
                    });
                    restIndex++;
                }
            }
        });
        return log;
    }, [plan, logged_sets, logged_rests, displayUnit, convertWeight]);

    return (
        <div className="flex flex-col items-center gap-8 min-h-screen p-6 pt-24 md:pt-32 w-full">
            {/* Header Section */}
            <div className="text-center w-full max-w-3xl">
                <p className="text-gray-500 mt-4">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <h1 className="text-4xl font-extrabold tracking-tight mt-1 mb-6">{workout_name}</h1>
            </div>

            {/* Stats Overview Grid */}
            <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Active Time" value={Math.ceil(active_time_seconds / 60)} unit="min" />
                <StatCard label="Total Volume" value={convertWeight(total_volume || 0)} unit={displayUnit} />
                <StatCard label="Total Reps" value={total_reps || 0} unit="reps" />
                <StatCard label="Sets" value={total_sets || 0} unit="sets" />
            </div>

            {/* Personal Records Section? */}

            {/* Detailed Log Section */}
            <div className="w-full max-w-3xl">
                <h2 className="text-lg font-bold text-gray-700 mb-3">Workout Log</h2>
                <div className="flex flex-col gap-3 text-left">
                    {displayLog.map(item => (
                        <LogEntry key={item.uniqueKey} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
}
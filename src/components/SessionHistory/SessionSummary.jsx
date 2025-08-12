'use client';

import { useMemo } from 'react';
import Link from 'next/link';

// A small, reusable component for displaying a single statistic.
const StatCard = ({ label, value, unit }) => (
    <div className="bg-white/40 p-4 rounded-lg shadow-sm text-center">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800">
            {value} <span className="text-sm font-normal">{unit}</span>
        </p>
    </div>
);

// A badge to highlight Personal Records
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
                <div className="text-right">
                    <p className="font-semibold text-gray-700">{item.performance}</p>
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
        logged_sets = [],
        logged_rests = [],
        started_at,
        total_paused_seconds,
        active_time_seconds,
        total_volume,
        total_reps,
        total_sets,
        workout_type
    } = sessionData;

    const date = new Date(started_at);

    const displayLog = useMemo(() => {
        const log = [];
        if (!plan?.workout_steps) return [];

        // Sort the rests once by their creation time.
        const sortedRests = [...logged_rests].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        let restIndex = 0; // This is our pointer for the next available rest.

        plan.workout_steps.forEach(step => {
            if (step.step_type === 'EXERCISE') {
                const isStretch = step.exercise?.mechanics?.some(m => m.name === 'Stretching');

                const setsForThisStep = logged_sets
                    .filter(ls => ls.exercise_id === step.exercise_id)
                    .sort((a, b) => a.set_number - b.set_number);

                setsForThisStep.forEach(loggedSet => {
                    // Add the logged set to our display log.
                    log.push({
                        id: loggedSet.id,
                        isSet: true,
                        name: step.exercise.name,
                        subtext: `Set ${loggedSet.set_number}`,
                        performance: `${loggedSet.reps_completed} reps @ ${loggedSet.weight_kg}kg`
                    });

                    // Check if an intra-set rest should follow.
                    const isLastSet = loggedSet.set_number >= step.target_sets;
                    if (!isLastSet && !isStretch) {
                        // If a rest is expected, take the next one from our sorted list.
                        if (restIndex < sortedRests.length) {
                            const intraSetRest = sortedRests[restIndex];
                            log.push({
                                id: intraSetRest.id,
                                isSet: false,
                                name: 'Rest',
                                subtext: `Target: ${intraSetRest.target_duration_seconds}s`,
                                performance: `${intraSetRest.actual_duration_seconds}s`
                            });
                            restIndex++; // Move the pointer to the next rest
                        }
                    }
                });
            } else if (step.step_type === 'REST') {
                // If the step is a dedicated rest block, take the next available rest.
                if (restIndex < sortedRests.length) {
                    const restBlock = sortedRests[restIndex];
                    log.push({
                        id: restBlock.id,
                        isSet: false,
                        name: 'Rest Block',
                        subtext: `Target: ${restBlock.target_duration_seconds}s`,
                        performance: `${restBlock.actual_duration_seconds}s`
                    });
                    restIndex++; // Move the pointer to the next rest
                }
            }
        });
        return log;
    }, [plan, logged_sets, logged_rests]);

    return (
        <div className="flex flex-col items-center gap-8 min-h-screen p-6 pt-24 md:pt-32 w-full">
            {/* Header Section */}
            <div className="text-center w-full max-w-3xl">
                <Link href="/history" className="text-sm text-purple-600 hover:underline">← Back to History</Link>
                <p className="text-gray-500 mt-4">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <h1 className="text-4xl font-extrabold tracking-tight mt-1 mb-6">{workout_name}</h1>
            </div>

            {/* Stats Overview Grid */}
            <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Active Time" value={Math.ceil(active_time_seconds / 60)} unit="min" />
                <StatCard label="Total Volume" value={total_volume || 0} unit="kg" />
                <StatCard label="Total Reps" value={total_reps || 0} unit="reps" />
                <StatCard label="Sets" value={total_sets || 0} unit="sets" />
            </div>

            {/* Personal Records Section? */}

            {/* Detailed Log Section */}
            <div className="w-full max-w-3xl">
                <h2 className="text-lg font-bold text-gray-700 mb-3">Workout Log</h2>
                <div className="flex flex-col gap-3 text-left">
                    {displayLog.map(item => (
                        <LogEntry key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
}
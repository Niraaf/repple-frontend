"use client";

import { useWorkoutDetails } from "@/hooks/useWorkoutDetails";
import { useEffect, useState } from "react";
import { useBlobTheme } from "@/hooks/useBlobTheme";

export default function WorkoutTimer({ workoutId }) {
    const [exercises, setExercises] = useState([]);
    const [workoutDetails, setWorkoutDetails] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(0);
    const [targetRestTime, setTargetRestTime] = useState(0);
    const [restOvertime, setRestOvertime] = useState(false);
    const [logOpen, setLogOpen] = useState(false);

    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [phase, setPhase] = useState("default"); // exercise || rest || default
    useBlobTheme(phase);

    const [sessionLog, setSessionLog] = useState([]);

    const {
        data,
        isPending: isLoading,
        isError,
    } = useWorkoutDetails(workoutId);

    useEffect(() => {
        if (data?.exercises) {
            setExercises(data.exercises);
            setWorkoutDetails({
                workoutName: data.workout_name,
                num_exercises: data.num_exercises,
                estimated_duration: data.estimated_duration,
                last_performed: data.last_performed,
            });
        }
    }, [data]);

    // Timer
    useEffect(() => {
        let interval;

        if (running) {
            interval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);

                if (phase === "rest") {
                    const remaining = targetRestTime - elapsed;

                    if (remaining >= 0) {
                        setSeconds(remaining);
                        setRestOvertime(false);
                    } else {
                        setSeconds(Math.abs(remaining));
                        setRestOvertime(true);
                    }
                } else {
                    setSeconds(elapsed);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [running, startTime, targetRestTime, phase]);

    const formatTime = (total) => {
        const mins = Math.floor(total / 60);
        const secs = total % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    const startWorkout = () => {
        setRunning(true);
        setPhase("exercise");
        setStartTime(Date.now());
    }

    // Finish an exercise, go into rest
    const completeExercise = () => {
        const now = Date.now();
        const duration = Math.floor((now - startTime) / 1000);
        const current = exercises[currentIndex];

        setSessionLog((prev) => [
            ...prev,
            {
                type: "exercise",
                name: current?.name || "Unknown",
                exerciseId: current?.id || `ex-${currentIndex}`,
                duration,
                startedAt: startTime,
                endedAt: now,
            },
        ]);

        const isLastSet = currentSet + 1 === current.sets;
        const isLastExercise = currentIndex + 1 === exercises.length;

        if (!(isLastExercise && isLastSet)) {
            const nextRestTime = isLastSet
                ? current.rest_between_exercise
                : current.rest_between_sets;

            setTargetRestTime(nextRestTime);
            setPhase("rest");
            setStartTime(Date.now());
            setSeconds(nextRestTime);
            setRunning(true);
        } else {
            setRunning(false);
            moveToNextExercise();
        }
    };


    const completeRest = () => {
        const now = Date.now();
        const duration = Math.floor((now - startTime) / 1000);
        setRestOvertime(false);

        // Log rest
        setSessionLog((prev) => [
            ...prev,
            {
                type: "rest",
                duration,
                startedAt: startTime,
                endedAt: now,
            },
        ]);

        moveToNextExercise();
    };

    const moveToNextExercise = () => {
        if (currentSet + 1 === exercises[currentIndex].sets) {
            setCurrentIndex((prev) => prev + 1);
            setCurrentSet(0);
        } else {
            setCurrentSet((prev) => prev + 1);
        }
        setStartTime(Date.now());
        setSeconds(0);
        setPhase("exercise");
        setRunning(true);
        setTargetRestTime(0);
    };

    const current = exercises[currentIndex];

    return (
        <div className="flex flex-col items-center w-full min-h-screen pt-30">
            {isLoading && (
                <p className="text-lg text-gray-600 mt-20">Getting your workout ready...</p>
            )}

            {!isLoading && !isError && current && (
                <div className="h-full">
                    {/* 🕹 Workout Title + Current Exercise Info */}
                    <div className="text-center">
                        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-800">
                            {workoutDetails.workoutName}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Exercise {currentIndex + 1} of {exercises.length}
                        </p>
                    </div>

                    {/* ⏱️ Timer Fullscreen Section */}
                    <div className="flex flex-col justify-center items-center w-full">
                        <h1
                            className={`text-[5rem] md:text-[9rem] font-extrabold leading-none transition-all duration-300 drop-shadow-md ${phase === "rest" && restOvertime
                                ? "text-red-600 animate-pulse"
                                : "text-gray-900"
                                }`}
                        >
                            {formatTime(seconds)}
                        </h1>

                        {phase === "rest" ? (

                            <p className="mt-2 text-sm md:text-lg text-blue-600 italic font-medium">
                                ⏳ Resting... (Target: {targetRestTime}s)
                            </p>
                        ) : (
                            <p className="mt-2 text-sm md:text-lg text-gray-700 font-medium">
                                {current.name} – Set {currentSet + 1} of {current.sets}
                            </p>
                        )}

                        {/* 🚀 Main Action Button */}
                        <button
                            onClick={phase === "exercise" ? completeExercise : phase === "rest" ? completeRest : startWorkout}
                            className={`mt-8 px-4 md:px-8 py-4 rounded-2xl text-white font-semibold text-xs md:text-base tracking-wide transition shadow-md backdrop-blur-md cursor-pointer
                                ${phase === "rest"
                                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600"
                                    : "bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 "
                                }`}
                        >
                            {phase === "exercise"
                                ? "✅ Done with this exercise"
                                : phase === "rest" ? "🚀 Done resting — Next exercise"
                                    : "Start Workout"}
                        </button>
                    </div>
                </div>
            )}

            {!isLoading && sessionLog.length > 0 && (
                <button
                    onClick={() => setLogOpen(true)}
                    className="fixed bottom-6 right-6 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-lg hover:bg-gray-700 transition z-50 cursor-pointer"
                >
                    📜 View Log
                </button>
            )}

            {/* 📝 Log Popup Panel */}
            {logOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex justify-center items-end sm:items-center" onClick={() => setLogOpen(false)}>
                    <div className="w-full sm:max-w-lg bg-white/50 border-4 border-b-0 border-white/30 rounded-t-3xl sm:rounded-2xl shadow-xl p-6 h-[80vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">🗂️ Session Log</h2>
                            <button
                                onClick={() => setLogOpen(false)}
                                className="text-gray-500 hover:text-gray-800 transition cursor-pointer"
                            >
                                ✖
                            </button>
                        </div>

                        <div className="space-y-3">
                            {sessionLog.map((entry, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all border-4 border-b-0 border-white/30 ${entry.type === "exercise"
                                        ? "bg-green-100/50 hover:bg-green-200/60"
                                        : "bg-blue-100/50 hover:bg-blue-200/60"
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-800">
                                            {entry.type === "exercise" ? "🏋️ Exercise" : "⏳ Rest"}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {entry.name ?? ""}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-700 font-semibold">
                                        {formatTime(entry.duration)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && !current && (
                <div className="text-center text-green-700 font-bold text-2xl mt-20">
                    🏁 Workout complete! Nice job.
                </div>
            )}
        </div>
    );

}


// -------------------------------
// 🛠️ NEXT STEPS FOR WORKOUT TIMER
// -------------------------------

/*
1. ✅ Workout Completion & Save
   - When workout is complete, show a "Workout Complete" screen.
   - Add a "Save Session" button.
   - Save sessionLog, workoutId, duration, timestamps, etc. to DB.

2. 💾 Preserve State Across Reloads
   - Use localStorage to save: currentIndex, currentSet, phase, sessionLog, startTime, etc.
   - Load from localStorage on mount if available.

3. ⚠️ Unsaved Changes Popup
   - Use global hasUnsavedChanges context.
   - Message: "You might lose your progress. Are you sure you want to leave?"
   - Trigger on reload, route change, or tab close.

4. ⏸️ Optional Pause Button
   - Pauses the timer, not the session state.
   - Optional: log pause/resume to sessionLog.
   - Low priority — no pause = more accurate workout data.

5. ⬅️ Back Button
   - Undo previous set/rest by popping from sessionLog.
   - Restore previous state: index, set, phase, startTime, seconds.
   - Optional: confirm before undoing.

6. 🎨 Styling
   - Animate transitions between exercises/rest.
   - Style the workout complete screen with flair (🎉 XP earned, summary, etc.)
   - Add cute icons, colors, and polish.
*/

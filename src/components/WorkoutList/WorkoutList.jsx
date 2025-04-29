"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/authContext";
import WorkoutCard from "../WorkoutCard/WorkoutCard";

export default function WorkoutList() {
    const { currentUser } = useAuth();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const getSupabaseUserId = async (firebaseUid) => {
        const res = await fetch(`/api/user/map-firebase?firebaseUid=${firebaseUid}`);
        const data = await res.json();
        return data.userId;
    };

    useEffect(() => {
        const fetchUserWorkouts = async () => {
            if (!currentUser) return;
            try {
                const supabaseUserId = await getSupabaseUserId(currentUser.uid);
                const res = await fetch(`/api/user/user-workouts?userId=${supabaseUserId}`);
                const data = await res.json();

                if (res.ok && data.length > 0) {
                    setWorkouts(data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to fetch workouts:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchUserWorkouts();
    }, [currentUser]);

    const handleClick = (id) => {
        window.location.href = `/workouts/${id}`;
    };

    const handleCreate = () => {
        window.location.href = "/workouts/create";
    };

    return (
        <div className="flex flex-col items-center gap-6 min-h-screen p-6 pt-30 w-full">
            {/* 🚀 Title */}
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                    Choose your Workout
                </h1>
                <p className="text-gray-400 text-sm">Select a workout to view and start your session!</p>
            </div>

            {/* Loading */}
            {loading && <p className="text-lg text-gray-400 animate-pulse">Loading your workouts...</p>}

            {/* No Workouts */}
            {error && (
                <p className="text-red-500 text-center text-lg">
                    You don't have any workouts yet. Create one!
                </p>
            )}

            {/* Workout List */}
            {!loading && !error && workouts.length > 0 && (
                <div className="flex flex-col gap-4 w-full max-w-3xl">
                    {workouts.map((workout, idx) => (
                        <WorkoutCard
                            key={workout.id}
                            workout={workout}
                            idx={idx}
                            onView={handleClick}
                        />
                    ))}
                </div>
            )}

            {/* Create Button */}
            {!loading && (
                <button
                    className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 
                     text-white font-bold py-3 px-8 rounded-full shadow-md transition cursor-pointer"
                    onClick={handleCreate}
                >
                    + Create New Workout
                </button>
            )}
        </div>
    );
}

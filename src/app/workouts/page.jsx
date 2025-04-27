"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/authContext";

export default function WorkoutListPage() {
    const { currentUser } = useAuth();
    const [workouts, setWorkouts] = useState([]);  // Store array of IDs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const getSupabaseUserId = async (firebaseUid) => {
        const res = await fetch(`/api/user/map-firebase?firebaseUid=${firebaseUid}`);
        const data = await res.json();
        return data.userId;  // This is profile.userid (Supabase UUID)
    };

    useEffect(() => {
        const fetchUserWorkouts = async () => {
            if (!currentUser) return;

            try {
                const supabaseUserId = await getSupabaseUserId(currentUser.uid);

                const res = await fetch(`/api/workout/user-workouts?userId=${supabaseUserId}`);
                const data = await res.json();

                if (res.ok && data.length > 0) {
                    setWorkouts(data);
                } else {
                    setError(true);  // No workouts found
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
        window.location.href = `/workouts/build/${id}`
    }

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center gap-8 bg-gray-50 p-6">
      
          {loading && <p className="text-lg text-gray-500 animate-pulse">Loading your workouts...</p>}
      
          {error && (
            <p className="text-red-500 text-center text-lg">
              You don't have any workouts yet. Create one!
            </p>
          )}
      
          {/* Workout List */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => handleClick(workout.id)}
                  className="w-60 h-30 border rounded-xl p-5 shadow-sm bg-white hover:shadow-lg hover:border-blue-400 cursor-pointer transition-all"
                >
                  <h2 className="text-xl font-semibold text-gray-700 overflow-hidden text-ellipsis ">{workout.name}</h2>
                  <p className="text-sm text-gray-400 mt-2">Click to edit this workout</p>
                </div>
              ))}
            </div>
          )}
      
          {/* Create New Workout Button */}
          {!loading && (
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition">
              + Create New Workout
            </button>
          )}
        </div>
      );
      
}

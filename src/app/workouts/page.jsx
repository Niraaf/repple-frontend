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
    window.location.href = `/workouts/${id}`
  }

  const gradientOptions = [
    "from-blue-400 to-purple-400",
    "from-green-400 to-teal-400",
    "from-pink-400 to-red-400",
    "from-yellow-400 to-orange-400",
    "from-indigo-400 to-cyan-400"
  ];

  const getRandomGradient = (idx) => {
    return gradientOptions[idx % gradientOptions.length];
  };

  const formatLastPerformed = (dateStr) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center gap-12 pt-24">

      {/* Loading State */}
      {loading && <p className="text-lg text-gray-500 animate-pulse">Loading your workouts...</p>}

      {/* No Workouts / Error State */}
      {error && (
        <p className="text-red-500 text-center text-lg">
          You don't have any workouts yet. Create one!
        </p>
      )}

      {/* Workout Display Grid */}
      {!loading && !error && workouts.length > 0 && (
        <div className="flex flex-wrap justify-center gap-8 max-w-7xl px-6">
          {workouts.map((workout, idx) => (
            <div
              key={workout.id}
              onClick={() => handleClick(workout.id)}
              className="w-64 bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition transform cursor-pointer relative overflow-hidden"
            >
              {/* Gradient Accent */}
              <div className={`absolute top-0 left-0 h-full w-2 bg-gradient-to-b ${getRandomGradient(idx)}`}></div>

              {/* Content */}
              <div className="p-5 pl-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-bold text-gray-800 truncate">{workout.name}</h2>
                </div>
                <p className="text-sm text-gray-600">{
                  `${workout.num_exercises} Exercises • ~${workout.estimated_duration} min`
                }</p>
                <p className="text-xs text-gray-400 mt-1">Last: {formatLastPerformed(workout.last_performed)}</p>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Create New Workout Button */}
      {!loading && (
        <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-md transition">
          + Create New Workout
        </button>
      )}
    </div>
  );



}

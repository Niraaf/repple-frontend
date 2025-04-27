"use client";

import React, { useState, useEffect } from "react";
import ExerciseSidebar from "../ExerciseSidebar/ExerciseSidebar";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAuth } from "@/contexts/authContext";
import { v4 as uuidv4 } from 'uuid';
import ExerciseCard from "../ExerciseCard/ExerciseCard";

export default function WorkoutBuilder({ workoutId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { currentUser } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("Untitled Workout");

  // Load existing workout only if workoutId exists (Edit Mode)
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError(false);

      try {
        const res = await fetch(`/api/workout/${workoutId}/exercises`);
        if (!res.ok) throw new Error("Failed to fetch exercises");

        const data = await res.json();
        setExercises(data.exercises);
        setWorkoutName(data.workoutName);
      } catch (err) {
        console.error("Error fetching exercises:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && workoutId) {
      fetchExercises();
    } else {
      setLoading(false);  // No fetch needed
    }
  }, [currentUser, workoutId]);


  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const getExerciseId = (exercise) => exercise.id || exercise.tempId;

  function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setExercises((prevItems) => {
        const oldIndex = prevItems.findIndex((i) => getExerciseId(i) === active.id);
        const newIndex = prevItems.findIndex((i) => getExerciseId(i) === over.id);
        return arrayMove(prevItems, oldIndex, newIndex);
      });
    }
  }

  const handleAddExercise = (exercise) => {
    setExercises((prev) => [
      ...prev,
      {
        tempId: uuidv4(),
        name: exercise.name,
        sets: 3,
        reps: 10,
        rest_seconds_planned: 120,
        exercise_definition_id: exercise.id,
        muscle_group: exercise.muscle_group,
        type: exercise.type,
        focus: exercise.focus,
        equipment: exercise.equipment,
        is_custom: exercise.is_custom
      }
    ]);
  };


  const handleOpenSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 🔥 Save Workout Button Handler
  const handleSaveWorkout = async () => {
    if (!currentUser) return;

    try {
      let savedWorkoutId = workoutId;

      // If it's a new workout (no ID), create it first
      if (!workoutId) {
        const res = await fetch('/api/workout/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.uid,
            name: workoutName || "Untitled Workout"
          })
        });

        const data = await res.json();
        savedWorkoutId = data.workoutId;
      }

      // Save exercises (bulk)
      await fetch(`/api/workout/${savedWorkoutId}/save-exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workoutName, exercises })
      });

      alert("Workout saved successfully!");
    } catch (err) {
      console.error("Failed to save workout:", err);
      alert("Error saving workout.");
    }
  };

  const handleExerciseChange = (index, field, value) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[index][field] = Number(value);  // Ensure number type
      return updated;
    });
  };


  return (
    <div className="min-h-screen relative p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exercises.map(getExerciseId)}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-col items-center justify-center w-full min-h-screen gap-8">

            {/* Loading & Error States */}
            {loading && (
              <p className="text-lg text-gray-500 animate-pulse mt-10">Loading your workout...</p>
            )}

            {error && (
              <p className="text-red-500 text-lg mt-10">Oops! Failed to load workout. Please try again.</p>
            )}

            {/* Main Content */}
            {!loading && !error && (
              <div className="flex flex-col items-center gap-8 w-full max-w-6xl">

                {/* Workout Name */}
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="Untitled Workout"
                  className="text-4xl font-bold text-center bg-transparent border-b-2 border-gray-300 focus:border-blue-400 focus:outline-none transition w-full max-w-xl"
                />

                {/* Exercise Cards */}
                <ul className="flex flex-wrap gap-6 p-6 bg-white border border-gray-200 rounded-xl shadow-md w-full justify-center min-h-[150px]">
                  {exercises.length === 0 ? (
                    <p className="text-gray-400 text-center">No exercises yet. Click "Add Exercise" to start building!</p>
                  ) : (
                    exercises.map((ex, idx) => (
                      <ExerciseCard
                        key={ex.id || ex.tempId}
                        ex={ex}
                        onChange={(field, value) => handleExerciseChange(idx, field, value)}
                      />
                    ))
                  )}
                </ul>

                {/* Action Buttons */}
                <div className="flex gap-5">
                  <button
                    onClick={handleOpenSidebar}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
                  >
                    ➕ Add Exercise
                  </button>

                  <button
                    onClick={handleSaveWorkout}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
                  >
                    💾 Save Workout
                  </button>
                </div>
              </div>
            )}

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm cursor-pointer"
                onClick={handleOpenSidebar}
              />
            )}

            {/* Sidebar */}
            <div
              className={`fixed top-0 right-0 z-50 h-full w-150 bg-white shadow-2xl transform transition-transform ease-in-out duration-300 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
              <ExerciseSidebar
                onAddExercise={handleAddExercise}
                addedExerciseIds={exercises.map((ex) => ex.exercise_definition_id)}
              />
            </div>

          </div>
        </SortableContext>
      </DndContext>
    </div>
  );

}

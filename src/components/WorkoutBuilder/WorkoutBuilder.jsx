"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  useSensor,
  useSensors,
  TouchSensor
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useAuth } from "@/contexts/authContext";
import { v4 as uuidv4 } from 'uuid';
import ExerciseCard from "../ExerciseCard/ExerciseCard";
import RestBlock from "../RestBlock/RestBlock";
import ExerciseModal from "../ExerciseModal/ExerciseModal";

export default function WorkoutBuilder({ workoutId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { currentUser } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("Untitled Workout");
  const [saving, setSaving] = useState(false);

  // Load existing workout only if workoutId exists (Edit Mode)
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError(false);

      try {
        const res = await fetch(`/api/workout/${workoutId}/workout-details`);
        if (!res.ok) throw new Error("Failed to fetch exercises");

        const data = await res.json();
        setExercises(data.exercises);
        setWorkoutName(data.workout_name);
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
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(MouseSensor)
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
        rest_between_sets: 120,
        rest_between_exercise: 180,
        exercise_definition_id: exercise.id,
        muscle_groups: exercise.muscle_groups,
        type: exercise.type,
        focus: exercise.focus,
        equipment: exercise.equipment,
        is_custom: exercise.is_custom
      }
    ]);
  };

  const handleDeleteExercise = (id) => {
    setExercises((prev) => prev.filter((ex) => (ex.id || ex.tempId) !== id));
  };

  const handleOpenModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const getSupabaseUserId = async (firebaseUid) => {
    const res = await fetch(`/api/user/map-firebase?firebaseUid=${firebaseUid}`);
    const data = await res.json();
    return data.userId;  // This is profile.userid (Supabase UUID)
  };

  // 🔥 Save Workout Button Handler
  const handleSaveWorkout = async () => {
    if (!currentUser || saving) return;
    let savedWorkoutId = workoutId;
    const supabaseUserId = await getSupabaseUserId(currentUser.uid);
    setSaving(true);
    try {
      // If it's a new workout (no ID), create it first
      if (!workoutId) {
        const res = await fetch('/api/workout/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: supabaseUserId,
            name: workoutName || "Untitled Workout",
            exercises
          })
        });

        const data = await res.json();
        savedWorkoutId = data.workoutId;
      }

      // Save exercises (bulk)
      await fetch(`/api/workout/${savedWorkoutId}/save-exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workoutName: workoutName || "Untitled Workout", exercises })
      });

      alert("Workout saved successfully!");
      window.location.href = `/workouts/${savedWorkoutId}`
    } catch (err) {
      console.error("Failed to save workout:", err);
      alert("Error saving workout.");
    } finally {
      setSaving(false);
    }
  };

  const handleExerciseChange = (index, field, value) => {
    setExercises(prev => {
      const updated = [...prev];

      // Remove leading zeros & parse number
      let numericValue = parseInt(value.replace(/^0+/, ''), 10);

      // Handle NaN edge case + clamp to range
      if (isNaN(numericValue)) numericValue = 0;
      numericValue = Math.min(numericValue, 999);

      updated[index][field] = numericValue;
      return updated;
    });
  };


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <SortableContext
        items={exercises.map(getExerciseId)}
        strategy={rectSortingStrategy}
      >
        <div className="flex flex-col items-center w-full min-h-screen pt-30">

          {/* Header */}
          {!loading && !error && (
            <div className="w-full max-w-3xl px-6 mb-2">
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Name your workout..."
                className="text-5xl font-extrabold tracking-tight text-gray-800 bg-transparent text-center focus:outline-none placeholder-gray-300 w-full"
              />
            </div>
          )}

          {/* Action Buttons - Clean & Centered */}
          {!loading && !error && (
            <div className="flex justify-center gap-4">
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition text-sm shadow-sm cursor-pointer"
              >
                ➕ Add Exercise
              </button>
              <button
                onClick={handleSaveWorkout}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition cursor-pointer ${saving ? "bg-green-300 cursor-not-allowed" : "bg-green-500/30 hover:bg-green-600/60"
                  } text-white shadow-md`}
                disabled={saving}
              >
                {saving ? "💾 Saving Workout..." : "💾 Save Workout"}
              </button>
            </div>
          )}

          {/* States */}
          {loading && <p className="text-gray-400 animate-pulse">Loading your quest...</p>}
          {error && <p className="text-red-500">Failed to load. Try again, hero!</p>}

          {/* Main Content */}
          {!loading && !error && (
            <div className="flex flex-col items-center gap-10 w-full max-w-5xl">

              {/* Exercise Flow */}
              <div className="flex flex-wrap justify-center gap-6 p-6 rounded-2xl w-full">

                {/* Modern Cards */}
                {exercises.length === 0 ? (
                  <p className="text-gray-400 italic">No exercises yet... click "Add Exercise" to begin.</p>
                ) : (
                  exercises.map((ex, idx) => (
                    <React.Fragment key={getExerciseId(ex)}>
                      <ExerciseCard
                        ex={ex}
                        index={idx}
                        onChange={(field, value) => handleExerciseChange(idx, field, value)}
                        onDelete={handleDeleteExercise}
                      />
                      {idx < exercises.length - 1 && (
                        <RestBlock
                          value={ex.rest_between_exercise}
                          onChange={(newValue) => handleExerciseChange(idx, 'rest_between_exercise', newValue)}
                        />
                      )}
                    </React.Fragment>
                  ))
                )}
              </div>
            </div>
          )}

          {isModalOpen && (
            <ExerciseModal
              onClose={handleOpenModal}
              onAddExercise={handleAddExercise}
              addedExerciseIds={exercises.map((ex) => ex.exercise_definition_id)}
            />
          )}

        </div>
      </SortableContext>
    </DndContext>
  );



}

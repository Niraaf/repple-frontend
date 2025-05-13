"use client";

import React, { useState, useEffect } from "react";
import isEqual from "fast-deep-equal";
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
import { v4 as uuidv4 } from 'uuid';
import ExerciseCard from "../ExerciseCard/ExerciseCard";
import RestBlock from "../RestBlock/RestBlock";
import ExerciseModal from "../ExerciseModal/ExerciseModal";
import { useWorkoutDetails } from "@/hooks/useWorkoutDetails";
import { useSaveWorkout } from "@/hooks/useSaveWorkout";
import { useRouter } from "next/navigation";
import { useUnsavedChanges } from "@/contexts/unsavedChangesContext";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";

export default function WorkoutBuilder({ workoutId }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("Untitled Workout");
  const [exercises, setExercises] = useState([]);

  const [initialWorkoutName, setInitialWorkoutName] = useState("Untitled Workout");
  const [initialExercises, setInitialExercises] = useState([]);

  const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedChanges();
  const { mutateAsync: saveWorkout, isPending: isSaving, isError: isSaveError } = useSaveWorkout();
  useUnsavedChangesWarning();

  const {
    data,
    isLoading,
    isError,
  } = useWorkoutDetails(workoutId);

  useEffect(() => {
    if (data?.exercises) {
      setExercises(data.exercises);
      setInitialExercises(data.exercises);
      setWorkoutName(data.workout_name || "Untitled Workout");
      setInitialWorkoutName(data.workout_name || "Untitled Workout");
    }
  }, [data]);

  const sanitizeExercise = (exercise) => {
    const fieldsToSanitize = ["sets", "reps", "rest_between_exercise", "rest_between_sets"];
    const cleaned = { ...exercise };

    fieldsToSanitize.forEach((field) => {
      const parsed = parseInt(exercise[field]);
      cleaned[field] = isNaN(parsed) ? 1 : Math.min(Math.max(parsed, 1), 999);
    });

    return cleaned;
  };

  const handleSaveWorkout = async () => {
    if (isSaving) return;
    if (exercises.length === 0) return window.alert("You need at least 1 exercise to save!")
    const sanitizedExercises = exercises.map(sanitizeExercise);
    const newWorkoutId = await saveWorkout({ workoutId, workoutName, exercises: sanitizedExercises });
    if (!isSaveError) {
      setHasUnsavedChanges(false);
      router.push(`/workouts/${newWorkoutId}`);
    }
  };

  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } })
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

  useEffect(() => {
    const changed =
      workoutName !== initialWorkoutName || !isEqual(exercises, initialExercises);
    setHasUnsavedChanges(changed);
  }, [workoutName, exercises, initialWorkoutName, initialExercises]);

  const handleDeleteExercise = (id) => {
    setExercises((prev) => prev.filter((ex) => (ex.id || ex.tempId) !== id));
  };

  const handleOpenModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleExerciseChange = (index, field, value) => {
    setExercises(prev => {
      const updated = [...prev];
      const updatedExercise = { ...updated[index] };
      const converted = String(value).replace(/[^0-9]/g, '');

      updatedExercise[field] = converted === "" ? "" : Math.min(Math.max(1, parseInt(converted)), 999);
      updated[index] = updatedExercise;
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
        <div className="flex flex-col items-center w-full min-h-screen p-10 pt-30">
          {/* Header */}
          {!isLoading && !isError && (
            <div className="w-full max-w-5xl mb-2">
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Name your workout..."
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 bg-transparent text-center focus:outline-none placeholder-gray-300 w-full"
              />
            </div>
          )}

          {/* Action Buttons - Clean & Centered */}
          {!isLoading && !isError && (
            <div className="flex flex-col md:flex-row justify-center gap-4 max-w-5xl text-sm md:text-base mb-10 relative">
              <div className="flex gap-4">
                <button
                  onClick={handleOpenModal}
                  className="bg-white/30 hover:bg-white/50 font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer"
                >
                  ➕ Add Exercise
                </button>
                <button
                  onClick={handleSaveWorkout}
                  className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 
                  text-white font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer"
                  disabled={isSaving}
                >
                  {isSaving ? "💾 Saving Workout..." : "💾 Save Workout"}
                </button>
              </div>
              {hasUnsavedChanges && (
                <div className="flex items-center justify-center">
                  <div className="px-5 py-2 bg-yellow-100 text-yellow-800 font-bold rounded-full shadow-md text-sm md:text-base animate-pulse">
                    ⚠️ Unsaved changes
                  </div>
                </div>
              )}
            </div>
          )}

          {/* States */}
          {isLoading && <p className="text-gray-400 animate-pulse">Loading your workout...</p>}
          {isError && <p className="text-red-500">Failed to load. Try again!</p>}

          {/* Main Content */}
          {!isLoading && !isError && (
            <div className="flex flex-col items-center gap-10 w-full max-w-5xl">

              {/* Exercise Flow */}
              <div className="flex flex-wrap justify-center gap-6 rounded-2xl w-full px-6">

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

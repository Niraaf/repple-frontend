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
import { v4 as uuidv4 } from 'uuid';
import ExerciseCard from "../ExerciseCard/ExerciseCard";
import RestBlock from "../RestBlock/RestBlock";
import ExerciseModal from "../ExerciseModal/ExerciseModal";
import { useWorkoutDetails } from "@/hooks/useWorkoutDetails";
import { useSaveWorkout } from "@/hooks/useSaveWorkout";
import { useRouter } from "next/navigation";

export default function WorkoutBuilder({ workoutId }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("Untitled Workout");
  const [exercises, setExercises] = useState([]);
  const { mutate: saveWorkout, isPending: isSaving } = useSaveWorkout();

  const {
    data,
    isLoading,
    isError,
  } = useWorkoutDetails(workoutId);

  useEffect(() => {
    if (data?.exercises) {
      setExercises(data.exercises);
      setWorkoutName(data.workout_name || "Untitled Workout");
    }
  }, [data]);

  const handleSaveWorkout = () => {
    if (isSaving) return;
    saveWorkout({ workoutId, workoutName, exercises });
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

  const handleDeleteExercise = (id) => {
    setExercises((prev) => prev.filter((ex) => (ex.id || ex.tempId) !== id));
  };

  const handleOpenModal = () => {
    setIsModalOpen(!isModalOpen);
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
        <div className="flex flex-col items-center w-full min-h-screen p-10 pt-30">

          {/* Header */}
          {!isLoading && !isError && (
            <div className="w-full max-w-5xl mb-2">
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
          {!isLoading && !isError && (
            <div className="flex justify-center gap-4 max-w-5xl text-sm md:text-base mb-6">
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

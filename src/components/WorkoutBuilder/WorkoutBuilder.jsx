"use client";

import React, { useState, useEffect } from "react";
import isEqual from "fast-deep-equal";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

// Components
import ExerciseCard from "../ExerciseCard/ExerciseCard"; // Assumes this is updated for the new data structure
import RestBlock from "../RestBlock/RestBlock";       // Assumes this is updated for the new data structure
import ExerciseModal from "../ExerciseModal/ExerciseModal";

// Hooks & Context
import { useWorkoutDetails, useCreateWorkout, useUpdateWorkout } from "@/hooks/useWorkouts";
import { useUnsavedChanges } from "@/contexts/unsavedChangesContext";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";

export default function WorkoutBuilder({ workoutId }) {
  const router = useRouter();
  const isNewWorkout = workoutId === "new";

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("Untitled Workout");
  const [steps, setSteps] = useState([]);

  // State for tracking unsaved changes
  const [initialState, setInitialState] = useState({ name: "Untitled Workout", steps: [] });
  const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedChanges();
  useUnsavedChangesWarning();

  // Data Fetching & Mutations from our new consolidated hook
  const { data: existingWorkout, isLoading, isError } = useWorkoutDetails(workoutId, {
    enabled: !isNewWorkout, // Only fetch if we are editing an existing workout
  });
  const { mutateAsync: createWorkout, isPending: isCreating } = useCreateWorkout();
  const { mutateAsync: updateWorkout, isPending: isUpdating } = useUpdateWorkout();
  const isSaving = isCreating || isUpdating;

  // Effect to populate the form when editing an existing workout
  useEffect(() => {
    if (existingWorkout) {
      const initialData = {
        name: existingWorkout.name || "Untitled Workout",
        steps: existingWorkout.workout_steps || [],
      };
      setWorkoutName(initialData.name);
      setSteps(initialData.steps);
      setInitialState(initialData);
    }
  }, [existingWorkout]);

  // Effect to track unsaved changes by comparing current state to initial state
  useEffect(() => {
    const changed = workoutName !== initialState.name || !isEqual(steps, initialState.steps);
    setHasUnsavedChanges(changed);
  }, [workoutName, steps, initialState]);

  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSteps((prevSteps) => {
        const oldIndex = prevSteps.findIndex((step) => step.id === active.id);
        const newIndex = prevSteps.findIndex((step) => step.id === over.id);
        return arrayMove(prevSteps, oldIndex, newIndex);
      });
    }
  };

  const handleAddExercise = (exercise) => {
    const newExerciseStep = {
      id: uuidv4(), // Temporary client-side ID for dnd-kit and keys
      step_type: 'EXERCISE',
      exercise_id: exercise.id,
      target_sets: 3,
      target_reps: '8-12',
      target_intra_set_rest_seconds: 60,
      notes: '',
      // exercise details for immediate rendering on the card
      exercise: exercise
    };

    // Automatically add a rest block after the new exercise if the previous step wasn't a rest block
    const lastStep = steps[steps.length - 1];
    if (steps.length > 0 && lastStep?.step_type !== 'REST') {
      const newRestStep = {
        id: uuidv4(),
        step_type: 'REST',
        target_duration_seconds: 90,
      };
      setSteps((prev) => [...prev, newRestStep, newExerciseStep]);
    } else {
      setSteps((prev) => [...prev, newExerciseStep]);
    }
  };

  const handleAddRest = () => {
    const newRestStep = {
      id: uuidv4(), // Temporary client-side ID
      step_type: 'REST',
      target_duration_seconds: 120, // Default rest time
    };
    setSteps((prev) => [...prev, newRestStep]);
  };

  const handleStepChange = (index, field, value) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[index] = { ...newSteps[index], [field]: value };
      return newSteps;
    });
  };

  const handleDeleteStep = (id) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));
  };

  const handleSaveWorkout = async () => {
    if (isSaving || steps.length === 0) {
      if (steps.length === 0) alert("Add at least one exercise to save.");
      return;
    }

    // Prepare the data for the API: add sequence_order and remove temporary fields
    const formattedSteps = steps.map((step, index) => {
      const { id, exercise, ...restOfStep } = step; // remove temp ID and exercise details
      return {
        ...restOfStep,
        sequence_order: index + 1,
      };
    });

    const workoutData = {
      name: workoutName || "Untitled Workout",
      steps: formattedSteps
    };

    try {
      let savedWorkout;
      if (isNewWorkout) {
        savedWorkout = await createWorkout(workoutData);
      } else {
        savedWorkout = await updateWorkout({ workoutId, ...workoutData });
      }

      setHasUnsavedChanges(false);
      // Redirect to the new/updated workout's page
      router.push(`/workouts/${savedWorkout.id}`);

    } catch (error) {
      console.error("Failed to save workout:", error);
      alert("Error: Could not save workout.");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <SortableContext
        items={steps.map(step => step.id)}
        strategy={rectSortingStrategy}
      >
        <div className="flex flex-col items-center w-full min-h-screen p-10 pt-30">
          {/* Header */}
          <div className="w-full max-w-5xl mb-2">
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Name your workout..."
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 bg-transparent text-center focus:outline-none placeholder-gray-300 w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-center gap-4 max-w-5xl text-sm md:text-base mb-10 relative">
            <div className="flex gap-4">
              <button onClick={() => setIsModalOpen(true)} className="bg-white/30 hover:bg-white/50 font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer">
                ➕ Add Exercise
              </button>
              <button onClick={handleAddRest} className="bg-white/30 hover:bg-white/50 font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer">
                ⏱️ Add Rest
              </button>
              <button onClick={handleSaveWorkout} className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 
                  text-white font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer" disabled={isSaving}>
                {isSaving ? "💾 Saving..." : "💾 Save Workout"}
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

          {/* Loading/Error States */}
          {isLoading && <p>Loading your workout...</p>}
          {isError && <p>Failed to load workout. Try again!</p>}

          {/* Main Content */}
          {!isLoading && !isError && (
            <div className="flex flex-wrap justify-center items-center gap-2 w-full max-w-5xl">
              {steps.length === 0 ? (
                <p className="text-gray-400 italic">No steps yet... add an exercise to begin.</p>
              ) : (
                steps.map((step, idx) => (
                  step.step_type === 'EXERCISE' ? (
                    <ExerciseCard
                      key={step.id}
                      id={step.id}
                      index={idx}
                      step={step}
                      onChange={(field, value) => handleStepChange(idx, field, value)}
                      onDelete={() => handleDeleteStep(step.id)}
                    />
                  ) : (
                    <RestBlock
                      key={step.id}
                      id={step.id}
                      index={idx}
                      step={step}
                      onChange={(field, value) => handleStepChange(idx, field, value)}
                      onDelete={() => handleDeleteStep(step.id)}
                    />
                  )
                ))
              )}
            </div>

          )}
          {isModalOpen && (
            <ExerciseModal
              onClose={() => setIsModalOpen(false)}
              onAddExercise={handleAddExercise}
              addedExerciseIds={steps.filter(s => s.step_type === 'EXERCISE').map(s => s.exercise_id)}
            />
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
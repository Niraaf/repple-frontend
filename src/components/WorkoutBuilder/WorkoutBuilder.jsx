"use client";

import React, { useState, useEffect, useMemo } from "react";
import isEqual from "fast-deep-equal";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

// Components
import ExerciseCard from "./ExerciseCard";
import RestBlock from "./RestBlock";
import ExerciseModal from "../ExerciseModal/ExerciseModal";
import ErrorDisplay from "./ErrorDisplay";
import WorkoutStats from "./WorkoutStats";

// Hooks & Context
import { useWorkoutDetails, useCreateWorkout, useUpdateWorkout, useDeleteWorkout } from "@/hooks/useWorkouts";
import { useCreateSession } from "@/hooks/useSession";
import { useUnsavedChanges } from "@/contexts/unsavedChangesContext";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { useConfirmationModal } from "@/hooks/useConfirmationModal";
import { useAlertModal } from "@/hooks/useAlertModal"
import { useAuth } from "@/contexts/authContext";
import toast from 'react-hot-toast';


export default function WorkoutBuilder({ workoutId, initialData }) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const isNewWorkout = workoutId === "new";
  const { showConfirmation, ConfirmationModalComponent } = useConfirmationModal();
  const { showAlert, AlertModalComponent } = useAlertModal();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("Untitled Workout");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isEditMode, setIsEditMode] = useState(isNewWorkout);
  const [steps, setSteps] = useState([]);
  const [initialState, setInitialState] = useState({ /* ... */ });
  const [isProcessing, setIsProcessing] = useState(false);

  const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedChanges();
  useUnsavedChangesWarning();

  // Data Fetching & Mutations
  const { data: existingWorkout, isLoading, isError, error } = useWorkoutDetails(workoutId, initialData);
  const { mutateAsync: createWorkout, isPending: isCreating } = useCreateWorkout();
  const { mutateAsync: updateWorkout, isPending: isUpdating } = useUpdateWorkout();
  const { mutate: deleteWorkout, isPending: isDeleting } = useDeleteWorkout();
  const { mutateAsync: createSession, isPending: isStarting } = useCreateSession();
  const isSaving = isCreating || isUpdating;

  const isOwner = useMemo(() => {
    if (isNewWorkout) return true;
    return existingWorkout?.created_by_user_id === userProfile?.id;
  }, [isNewWorkout, existingWorkout, userProfile]);

  useEffect(() => {
    if (isNewWorkout) {
      // If it's a new workout, define the clean initial state here.
      const newWorkoutState = {
        name: "Untitled Workout",
        steps: [],
        description: "",
        isPublic: false
      };
      // Set both the active state and the "original" state at the same time.
      setWorkoutName(newWorkoutState.name);
      setSteps(newWorkoutState.steps);
      setDescription(newWorkoutState.description);
      setIsPublic(newWorkoutState.isPublic);
      setInitialState(newWorkoutState);
    } else if (initialData || existingWorkout) {
      // Use the data from the server if it exists.
      const dataToLoad = existingWorkout || initialData;
      const loadedSteps = (dataToLoad.workout_steps || []).map(step => ({
        ...step,
        // Ensure every step has a unique key for dnd-kit, even from the DB
        id: step.id || uuidv4()
      }));

      const initialDataObj = {
        name: dataToLoad.name || "Untitled Workout",
        steps: loadedSteps,
        description: dataToLoad.description || "",
        isPublic: dataToLoad.is_public || false,
      };
      setWorkoutName(initialDataObj.name);
      setSteps(initialDataObj.steps);
      setDescription(initialDataObj.description);
      setIsPublic(initialDataObj.isPublic);
      setInitialState(initialDataObj);
    }
  }, [isNewWorkout, existingWorkout, initialData]);

  // Effect to track unsaved changes by comparing current state to initial state
  useEffect(() => {
    const changed =
      workoutName !== initialState.name ||
      description !== initialState.description ||
      isPublic !== initialState.isPublic ||
      !isEqual(steps, initialState.steps);
    setHasUnsavedChanges(changed);
  }, [workoutName, description, isPublic, steps, initialState, setHasUnsavedChanges]);

  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } })
  );

  const handleStartWorkout = async () => {
    if (isStarting || !userProfile) return;

    try {
      const newSession = await createSession({ workoutId });
      router.push(`/session/${newSession.id}`);

    } catch (error) {
      console.error("Failed to start session:", error);
      showAlert({
        title: "Error",
        message: "Could not start the workout session. Please try again."
      });
    }
  };

  const cleanAndMergeSteps = (steps) => {
    let wasChanged = false;
    if (steps.length < 2) {
      return { cleanedSteps: steps, wasChanged: false };
    }

    const cleanedSteps = steps.reduce((acc, currentStep) => {
      const lastStep = acc[acc.length - 1];

      if (lastStep && lastStep.step_type === 'REST' && currentStep.step_type === 'REST') {
        wasChanged = true;
        lastStep.target_duration_seconds =
          (parseInt(lastStep.target_duration_seconds) || 0) +
          (parseInt(currentStep.target_duration_seconds) || 0);
      } else {
        acc.push(currentStep);
      }
      return acc;
    }, []);

    return { cleanedSteps, wasChanged };
  };

  function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSteps((prevSteps) => {
        const oldIndex = prevSteps.findIndex((step) => step.id === active.id);
        const newIndex = prevSteps.findIndex((step) => step.id === over.id);
        return arrayMove(prevSteps, oldIndex, newIndex);
      });
    }
  }

  const handleAddExercise = (exercise) => {
    const newExerciseStep = {
      id: uuidv4(), // Temporary client-side ID for dnd-kit and keys
      step_type: 'EXERCISE',
      exercise_id: exercise.id,
      target_sets: 3,
      target_reps: '8-12',
      target_intra_set_rest_seconds: 60,
      target_duration_seconds: 60,
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
        target_duration_seconds: 90
      };
      setSteps((prev) => [...prev, newRestStep, newExerciseStep]);
    } else {
      setSteps((prev) => [...prev, newExerciseStep]);
    }
  };

  const handleAddRest = () => {
    const newRestStep = {
      id: uuidv4(),
      step_type: 'REST',
      target_duration_seconds: 120
    };

    setSteps((prev) => [...prev, newRestStep]);
  };

  const handleStepChange = (index, field, value) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      const stepToUpdate = { ...newSteps[index] };

      const numericFields = ['target_sets', 'target_intra_set_rest_seconds', 'target_duration_seconds'];

      if (numericFields.includes(field)) {
        // Only allow digits
        const sanitizedValue = value.toString().replace(/[^0-9]/g, '');
        if (sanitizedValue === '') {
          stepToUpdate[field] = ''; // Allow the user to clear the input
        } else {
          let numericValue = parseInt(sanitizedValue, 10);
          // Cap the value at 999
          stepToUpdate[field] = Math.min(numericValue, 999);
        }
      } else {
        // For non-numeric fields like target_reps
        stepToUpdate[field] = value;
      }

      newSteps[index] = stepToUpdate;
      return newSteps;
    });
  };

  const handleStepBlur = (index, field) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      const stepToUpdate = { ...newSteps[index] };

      // If the value is empty or 0 on blur, default it to 1
      if (stepToUpdate[field] === '' || parseInt(stepToUpdate[field], 10) === 0) {
        stepToUpdate[field] = 1;
      }

      newSteps[index] = stepToUpdate;
      return newSteps;
    });
  };

  const handleDeleteStep = (idToDelete) => {
    setSteps(currentSteps => currentSteps.filter(step => step.id !== idToDelete));
  };

  const handleSaveWorkout = async () => {
    if (isSaving || !steps.some(step => step.step_type === 'EXERCISE')) {
      if (!isSaving) {
        showAlert({
          title: "Invalid Workout",
          message: "Please add at least one exercise before saving.",
        });
      }
      return;
    }

    let { cleanedSteps, wasChanged } = cleanAndMergeSteps(steps);
    if (wasChanged) {
      const confirmed = await showConfirmation({
        title: "Auto-Merge Rests?",
        description: "We noticed some consecutive rest periods and automatically combined them for you. Is this okay?",
        confirmText: "Yes, Save",
        confirmVariant: "positive"
      });

      if (!confirmed) return;
    }

    const workoutData = {
      name: workoutName,
      description: description,
      is_public: isPublic,
      steps: cleanedSteps.map((step, index) => {
        const { id, exercise, ...restOfStep } = step;
        return { ...restOfStep, sequence_order: index + 1 };
      }),
    };

    try {
      setIsProcessing(true);
      let savedWorkout;
      if (isNewWorkout) {
        const promise = createWorkout(workoutData);

        toast.promise(promise, {
          loading: 'Saving new workout...',
          success: 'Workout created successfully!',
          error: 'Failed to create workout.',
        });

        savedWorkout = await promise;
        setHasUnsavedChanges(false);
        router.push(`/workouts/${savedWorkout.id}`);
      } else {
        const promise = updateWorkout({ workoutId, workoutData });

        toast.promise(promise, {
          loading: 'Updating workout...',
          success: 'Workout saved successfully!',
          error: 'Failed to save changes.',
        });

        await promise;
        setIsEditMode(false);
      }

    } catch (error) {
      console.error("Failed to save workout:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteWorkout = async () => {
    if (isDeleting) return;

    const confirmed = await showConfirmation({
      title: "Delete this workout?",
      description: "This action cannot be undone. All associated steps and history for this plan will be permanently removed.",
      confirmText: "Delete",
      confirmVariant: "destructive"
    });

    if (!confirmed) {
      console.log("User cancelled deletion.");
      return;
    }

    const toastId = toast.loading('Deleting workout...');

    try {
      setIsProcessing(true);
      await deleteWorkout(workoutId);
      toast.success('Workout successfully deleted!', { id: toastId });
      router.push('/workouts');

    } catch (error) {
      toast.dismiss(toastId);
      showAlert({
        title: "Deletion Failed",
        message: error.message || "Could not delete the workout. Please try again."
      });

      console.error("Deletion failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !userProfile) { return <div className="flex justify-center items-center h-screen">Loading workout...</div>; }
  if (isError) { return <ErrorDisplay error={error} />; }

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
          <div className="w-full max-w-5xl mb-2 relative">
            {hasUnsavedChanges && (
              <div className="flex items-center justify-center">
                <div className="absolute -top-12 px-5 py-2 bg-yellow-100 text-yellow-800 font-bold rounded-full shadow-md text-sm md:text-base animate-pulse">
                  ⚠️ Unsaved changes
                </div>
              </div>
            )}
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              readOnly={!isEditMode || isProcessing}
              placeholder="Name your workout..."
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 bg-transparent text-center focus:outline-none w-full"
            />
            {(isEditMode || (description && description.trim() !== '')) && (
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                readOnly={!isEditMode || isProcessing}
                placeholder="Add a description..."
                className="w-full text-center text-sm text-gray-500 bg-transparent focus:outline-none mt-2 read-only:ring-0 read-only:border-transparent"
              />
            )}
          </div>

          {/* Stats (View Mode Only) */}
          {!isEditMode && (initialData || existingWorkout) && (
            <WorkoutStats workout={initialData || existingWorkout} />
          )}

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-center gap-4 max-w-5xl text-sm md:text-base mb-2 relative">
            {isEditMode ? (
              <div className="flex gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={isProcessing}
                  className="bg-white/30 hover:bg-white/50 font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer"
                >
                  ➕ Add Exercise
                </button>
                <button
                  onClick={handleAddRest}
                  disabled={isProcessing}
                  className="bg-white/30 hover:bg-white/50 font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer"
                >
                  ⏱️ Add Rest
                </button>
                <button
                  onClick={handleSaveWorkout}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 
                  text-white font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer"
                >
                  {isProcessing ? "💾 Saving..." : "💾 Save Workout"}
                </button>
                {!isNewWorkout && (
                  <button
                    onClick={handleDeleteWorkout}
                    disabled={isProcessing}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer"
                  >
                    {isProcessing ? "Deleting..." : "🗑️ Delete"}
                  </button>
                )}
              </div>
            ) : (isOwner
              ? (
                <div className="flex gap-4">
                  <button
                    className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 
                            font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer"
                    onClick={handleStartWorkout}
                    disabled={isProcessing || isStarting}
                  >
                    ▶️ Start
                  </button>

                  <button
                    onClick={() => {
                      if (isOwner) {
                        setIsEditMode(true);
                      }
                    }}
                    disabled={isProcessing}
                    className="bg-white/30 hover:bg-white/50 font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer"
                  >
                    ✏️ Edit
                  </button>
                </div>
              )
              : (
                <div className="flex gap-4">
                  <button
                    onClick={() => alert("Copies workout to non-owner user profile (TO IMPLEMENT)")}
                    disabled={isProcessing}
                    className="bg-white/30 hover:bg-white/50 font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer"
                  >
                    Copy Workout to Profile
                  </button>
                </div>
              )
            )}
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {isEditMode ? (
              // --- EDIT MODE
              <>
                <label htmlFor="isPublicToggle" className="text-sm font-medium text-gray-600">
                  Share with community?
                </label>
                <input
                  type="checkbox"
                  id="isPublicToggle"
                  checked={isPublic}
                  readOnly={isProcessing}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </>
            ) : (
              // --- VIEW MODE
              isPublic ? (
                <div className="flex items-center gap-2 px-3 py-1 text-green-700 text-xs font-bold rounded-full">
                  <span>🌐</span>
                  <span>Public</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 text-gray-600 text-xs font-bold rounded-full">
                  <span>🔒</span>
                  <span>Private</span>
                </div>
              )
            )}
          </div>

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
                      isEditMode={isEditMode}
                      isProcessing={isProcessing}
                      onBlur={(field) => handleStepBlur(idx, field)}
                      onChange={(field, value) => handleStepChange(idx, field, value)}
                      onDelete={() => handleDeleteStep(step.id)}
                    />
                  ) : (
                    <RestBlock
                      key={step.id}
                      id={step.id}
                      inputId={`rest-${idx}`}
                      index={idx}
                      step={step}
                      isEditMode={isEditMode}
                      isProcessing={isProcessing}
                      onBlur={(field) => handleStepBlur(idx, field)}
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
      {ConfirmationModalComponent}
      {AlertModalComponent}
    </DndContext>
  );
}
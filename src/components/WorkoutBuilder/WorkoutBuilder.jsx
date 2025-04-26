"use client";

import React, { useState } from "react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import ExerciseCard from "../ExerciseCard/ExerciseCard";

export default function WorkoutBuilder() {
  const [exercises, setExercises] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setExercises((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      // TODO: persist `exercises` order via API here
    }
  }

  const handleOpenSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  }

  const handleAddExercise = (exercise) => {
    setExercises((prev) => {
      if (prev.find(ex => ex.id === exercise.id)) return prev;
      return [
        ...prev,
        {
          ...exercise,
          sets: 3,      // Default values, can be adjusted later
          reps: 10,
          rest: 60,
        }
      ]
    });
  };

  return (
    <div className="min-h-screen relative">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exercises.map((ex) => ex.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex items-center justify-center min-h-screen gap-5">
            <div className="flex flex-col items-center justify-center gap-5">
              <ul className="space-y-2 p-5 border border-black max-w-[350px]">
                {exercises.map((ex) => (
                  <ExerciseCard key={ex.id} {...ex} />
                ))}
              </ul>
              <button
                onClick={handleOpenSidebar}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md transition-all duration-300 hover:shadow-lg"
              >
                Add Exercise
              </button>
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
              <div className="fixed inset-0 bg-black/30 z-40" onClick={handleOpenSidebar} />
            )}

            {/* Sidebar */}
            <div
              className={`fixed top-0 right-0 z-50 min-h-screen bg-white shadow-xl transform transition-transform ease-in-out duration-300 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
              <ExerciseSidebar
                onAddExercise={handleAddExercise}
                addedExerciseIds={exercises.map((ex) => ex.id)}
              />
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );

}
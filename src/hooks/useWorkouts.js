// src/hooks/useWorkouts.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext'; // Assuming you still need this for conditional enabling

// =================================================================
//  1. Query Keys Factory
//  A central place for managing query keys. Prevents typos and makes invalidation easy.
// =================================================================
const workoutsKeys = {
    all: ['workouts'], // Root key for the entire resource
    lists: () => [...workoutsKeys.all, 'list'], // Key for lists of workouts
    list: (filters) => [...workoutsKeys.lists(), { filters }], // Key for a specific, filtered list
    details: () => [...workoutsKeys.all, 'detail'], // Key for individual workouts
    detail: (id) => [...workoutsKeys.details(), id], // Key for a specific workout
};


// =================================================================
//  2. API Service Functions
//  Clean, async functions that perform the actual fetch requests.
// =================================================================

// GET /api/workouts
const getWorkouts = async () => {
    const res = await fetch('/api/workouts');
    if (!res.ok) throw new Error('Failed to fetch workouts');
    return res.json();
};

// GET /api/workout/:id
const getWorkoutById = async (workoutId) => {
    if (!workoutId) return null; // Don't fetch if there's no ID
    const res = await fetch(`/api/workout/${workoutId}`);
    if (!res.ok) throw new Error('Failed to fetch workout details');
    return res.json();
};

// POST /api/workout
const createWorkout = async (workoutData) => {
    const res = await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData),
    });
    if (!res.ok) throw new Error('Failed to create workout');
    return res.json();
};

// PUT /api/workout/:id
const updateWorkout = async ({ workoutId, ...workoutData }) => {
    const res = await fetch(`/api/workout/${workoutId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData),
    });
    if (!res.ok) throw new Error('Failed to update workout');
    return res.json();
};

// DELETE /api/workout/:id
const deleteWorkout = async (workoutId) => {
    const res = await fetch(`/api/workout/${workoutId}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete workout');
    return true; // Or whatever your API returns on successful delete
};


// =================================================================
//  3. Custom React Query Hooks
//  These are the hooks you'll import and use in your components.
// =================================================================

/**
 * Hook to fetch a list of the current user's workouts.
 */
export const useUserWorkouts = () => {
    const { currentUser } = useAuth();
    return useQuery({
        queryKey: workoutsKeys.lists(),
        queryFn: getWorkouts,
        enabled: !!currentUser, // Only run the query if a user is logged in
    });
};

/**
 * Hook to fetch the details of a single workout by its ID.
 * @param {string} workoutId - The UUID of the workout.
 */
export const useWorkoutDetails = (workoutId) => {
    const { currentUser } = useAuth();
    return useQuery({
        queryKey: workoutsKeys.detail(workoutId),
        queryFn: () => getWorkoutById(workoutId),
        enabled: workoutId !== "new" && !!currentUser 
    });
};

/**
 * Hook providing a mutation function to create a new workout.
 */
export const useCreateWorkout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createWorkout,
        onSuccess: () => {
            // When a new workout is created, invalidate the list of workouts to refetch it.
            queryClient.invalidateQueries({ queryKey: workoutsKeys.lists() });
        },
    });
};

/**
 * Hook providing a mutation function to update an existing workout.
 */
export const useUpdateWorkout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateWorkout,
        onSuccess: (data, variables) => {
            const { workoutId } = variables;
            // After updating, refetch both the list and the specific detail query for this workout.
            queryClient.invalidateQueries({ queryKey: workoutsKeys.lists() });
            queryClient.invalidateQueries({ queryKey: workoutsKeys.detail(workoutId) });
        },
    });
};

/**
 * Hook providing a mutation function to delete a workout.
 */
export const useDeleteWorkout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWorkout,
        onSuccess: (data, workoutId) => {
            // After deleting, refetch the list.
            queryClient.invalidateQueries({ queryKey: workoutsKeys.lists() });
            // You can also remove the specific detail query from the cache if you want.
            queryClient.removeQueries({ queryKey: workoutsKeys.detail(workoutId) });
        },
    });
};
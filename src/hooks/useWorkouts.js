// src/hooks/useWorkouts.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';

// =================================================================
//  1. Query Keys Factory (No changes needed)
// =================================================================
const workoutsKeys = {
    all: ['workouts'],
    lists: () => [...workoutsKeys.all, 'list'],
    list: (userId) => [...workoutsKeys.lists(), userId], // Key is now user-specific
    details: () => [...workoutsKeys.all, 'detail'],
    detail: (id) => [...workoutsKeys.details(), id],
};


// =================================================================
//  2. API Service Functions (UPDATED FOR DEV AUTH & NEW ROUTES)
//  These functions now require firebaseUid to be passed.
// =================================================================

// GET /api/workouts?firebaseUid=...
const getWorkouts = async (firebaseUid) => {
    const res = await fetch(`/api/workouts?firebaseUid=${firebaseUid}`);
    if (!res.ok) throw new Error('Failed to fetch workouts');
    return res.json();
};

// GET /api/workouts/:id
const getWorkoutById = async (workoutId, firebaseUid) => {
    if (!workoutId || !firebaseUid) return null;

    const res = await fetch(`/api/workouts/${workoutId}?firebaseUid=${firebaseUid}`);

    if (!res.ok) {
        const errorInfo = await res.json();
        const error = new Error(errorInfo.message || 'An error occurred while fetching the data.');
        error.status = res.status;
        throw error;
    }

    return res.json();
};

// POST /api/workouts
const createWorkout = async ({ workoutData, firebaseUid }) => {
    const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...workoutData, firebaseUid }),
    });
    //if (!res.ok) throw new Error('Failed to create workout');
    return res.json();
};

// PUT /api/workouts/:id
const updateWorkout = async ({ workoutId, workoutData, firebaseUid }) => {
    const res = await fetch(`/api/workouts/${workoutId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...workoutData, firebaseUid }),
    });
    if (!res.ok) throw new Error('Failed to update workout');
    return res.json();
};

// DELETE /api/workouts/:id
const deleteWorkout = async ({ workoutId, firebaseUid }) => {
    const res = await fetch(`/api/workouts/${workoutId}?firebaseUid=${firebaseUid}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete workout');
    return true;
};


// =================================================================
//  3. Custom React Query Hooks (UPDATED)
// =================================================================
/**
 * Hook to fetch a list of workouts for a specific user.
 * @param {string} firebaseUid - The Firebase UID of the user.
 */
export const useUserWorkouts = (firebaseUid) => {
    return useQuery({
        queryKey: workoutsKeys.list(firebaseUid),
        queryFn: () => getWorkouts(firebaseUid),
        // The query will only run if a firebaseUid is provided.
        enabled: !!firebaseUid,
    });
};

/**
 * Hook to fetch the details of a single workout by its ID.
 * @param {string} workoutId - The UUID of the workout.
 * @param {string} firebaseUid - The Firebase UID of the current user.
 * @param {object} options - Optional React Query options.
 */
export const useWorkoutDetails = (workoutId, firebaseUid, options = {}) => {
    return useQuery({
        queryKey: workoutsKeys.detail(workoutId),
        queryFn: () => getWorkoutById(workoutId, firebaseUid),
        enabled: workoutId !== "new" && !!firebaseUid,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
            if (error.status >= 400 && error.status < 500) return false;
            return failureCount < 2;
        },
        ...options
    });
};

/**
 * Hook providing a mutation function to create a new workout.
 */
export const useCreateWorkout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createWorkout, // Expects { workoutData, firebaseUid }
        onSuccess: () => {
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
        mutationFn: updateWorkout, // Expects { workoutId, workoutData, firebaseUid }
        onSuccess: (data, variables) => {
            const { workoutId } = variables;
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
        mutationFn: deleteWorkout, // Expects { workoutId, firebaseUid }
        onSuccess: (data, variables) => {
            const { workoutId } = variables;
            queryClient.invalidateQueries({ queryKey: workoutsKeys.lists() });
            queryClient.removeQueries({ queryKey: workoutsKeys.detail(workoutId) });
        },
    });
};
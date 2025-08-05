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
 * Hook to fetch a list of the current user's workouts.
 */
export const useUserWorkouts = () => {
    const { currentUser } = useAuth();
    return useQuery({
        // The query key is now user-specific, so if the user changes, the data will be refetched.
        queryKey: workoutsKeys.list(currentUser?.uid),
        // Pass the UID to the fetch function.
        queryFn: () => getWorkouts(currentUser.uid),
        // Only run the query if a user is logged in.
        enabled: !!currentUser,
    });
};

/**
 * Hook to fetch the details of a single workout by its ID.
 */
export const useWorkoutDetails = (workoutId, options = {}) => {
    const { currentUser } = useAuth();
    return useQuery({
        queryKey: workoutsKeys.detail(workoutId),
        queryFn: () => getWorkoutById(workoutId, currentUser?.uid),
        // The enabled check now also respects options passed from the component (like router.isReady)
        enabled: workoutId !== "new" && !!currentUser && (options.enabled ?? true),
        refetchOnWindowFocus: false,
        ...options
    });
};

/**
 * Hook providing a mutation function to create a new workout.
 */
export const useCreateWorkout = () => {
    const queryClient = useQueryClient();
    const { currentUser } = useAuth();

    return useMutation({
        mutationFn: (workoutData) => {
            if (!currentUser) throw new Error("User not authenticated.");
            return createWorkout({ workoutData, firebaseUid: currentUser.uid });
        },
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
    const { currentUser } = useAuth();

    return useMutation({
        mutationFn: ({ workoutId, workoutData }) => {
            if (!currentUser) throw new Error("User not authenticated.");
            return updateWorkout({ workoutId, workoutData, firebaseUid: currentUser.uid });
        },
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
    const { currentUser } = useAuth();

    return useMutation({
        mutationFn: (workoutId) => {
            if (!currentUser) throw new Error("User not authenticated.");
            return deleteWorkout({ workoutId, firebaseUid: currentUser.uid });
        },
        onSuccess: (data, workoutId) => {
            queryClient.invalidateQueries({ queryKey: workoutsKeys.lists() });
            queryClient.removeQueries({ queryKey: workoutsKeys.detail(workoutId) });
        },
    });
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getAuthHeaders } from '@/lib/apiClient';

// Query Keys Factory

const workoutsKeys = {
    all: ['workouts'],
    lists: () => [...workoutsKeys.all, 'list'],
    list: (userId) => [...workoutsKeys.lists(), userId],
    details: () => [...workoutsKeys.all, 'detail'],
    detail: (id) => [...workoutsKeys.details(), id],
};


// API Service Functions

const getWorkouts = async () => {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/workouts', { headers });
    if (!res.ok) throw new Error('Failed to fetch workouts');
    return res.json();
};

const getWorkoutById = async (workoutId) => {
    if (!workoutId || workoutId === "new") return null;
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/workouts/${workoutId}`, { headers });
    if (!res.ok) {
        const errorInfo = await res.json();
        const error = new Error(errorInfo.message || 'An error occurred while fetching the data.');
        error.status = res.status;
        throw error;
    }
    return res.json();
};

const createWorkout = async (workoutData) => {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/workouts', {
        method: 'POST',
        headers,
        body: JSON.stringify(workoutData),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create workout');
    }
    return res.json();
};

const updateWorkout = async ({ workoutId, workoutData }) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/workouts/${workoutId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(workoutData),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update workout');
    }
    return res.json();
};

const deleteWorkout = async (workoutId) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/workouts/${workoutId}`, {
        method: 'DELETE',
        headers,
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete workout');
    }
    return true;
};


// Custom React Query Hooks

export const useUserWorkouts = (initialData = null) => {
    const { user } = useAuth();
    return useQuery({
        queryKey: workoutsKeys.list(user?.id),
        queryFn: getWorkouts,
        initialData: initialData,
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
    });
};

export const useWorkoutDetails = (workoutId, initialData = null) => {
    const { user } = useAuth();
    return useQuery({
        queryKey: workoutsKeys.detail(workoutId),
        queryFn: () => getWorkoutById(workoutId),
        initialData: initialData,
        enabled: !!user && !!workoutId && workoutId !== 'new',
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
            if (error.status >= 400 && error.status < 500) return false;
            return failureCount < 2;
        },
    });
};

export const useCreateWorkout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createWorkout,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workoutsKeys.lists() });
        },
    });
};

export const useUpdateWorkout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateWorkout,
        onSuccess: (updatedWorkoutData) => {
            const workoutId = updatedWorkoutData.id;
            queryClient.setQueryData(workoutsKeys.detail(workoutId), updatedWorkoutData);
            queryClient.invalidateQueries({ queryKey: workoutsKeys.lists() });
        },
    });
};

export const useDeleteWorkout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWorkout,
        onSuccess: (data, workoutId) => {
            queryClient.invalidateQueries({ queryKey: workoutsKeys.lists() });
            queryClient.removeQueries({ queryKey: workoutsKeys.detail(workoutId) });
        },
    });
};
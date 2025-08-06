import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- Query Keys Factory ---
const sessionsKeys = {
    all: ['sessions'],
    active: () => [...sessionsKeys.all, 'active'],
    detail: (id) => [...sessionsKeys.all, 'detail', id],
};

// =================================================================
//  API Service Function
// =================================================================

/**
 * Calls the backend API to create a new workout session record.
 */
const createSession = async ({ workoutId, firebaseUid }) => {
    const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workoutId, firebaseUid }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to start workout session');
    }

    return res.json();
};

const getSessionById = async (sessionId, firebaseUid) => {
    if (!sessionId || !firebaseUid) return null;
    const res = await fetch(`/api/sessions/${sessionId}?firebaseUid=${firebaseUid}`);
    if (!res.ok) {
        const errorInfo = await res.json();
        const error = new Error(errorInfo.message || 'An error occurred while fetching the session.');
        error.status = res.status;
        throw error;
    }
    return res.json();
};

const logSet = async ({ setData, firebaseUid }) => {
    const res = await fetch('/api/logged_sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...setData, firebaseUid }),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to log set');
    }
    return res.json();
};

const logRest = async ({ restData, firebaseUid }) => {
    const res = await fetch('/api/logged_rests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...restData, firebaseUid }),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to log rest period');
    }
    return res.json();
};

const finishSession = async ({ sessionId, firebaseUid }) => {
    const res = await fetch(`/api/sessions/${sessionId}/finish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid }),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to finish session');
    }
    return res.json();
};

// =================================================================
//  Custom React Query Hooks
// =================================================================

/**
 * Hook providing a mutation function to create a new workout session.
 * It expects an object like { workoutId, firebaseUid } to be passed to its mutate function.
 */
export const useCreateSession = () => {
    return useMutation({
        mutationFn: createSession,
    });
};

/**
 * Hook to fetch all the details required to run a workout session.
 * @param {string} sessionId - The UUID of the session.
 * @param {string} firebaseUid - The Firebase UID of the current user.
 * @param {object} options - Optional React Query options.
 */
export const useSessionDetails = (sessionId, firebaseUid, options = {}) => {
    return useQuery({
        queryKey: sessionsKeys.detail(sessionId),
        queryFn: () => getSessionById(sessionId, firebaseUid),
        enabled: !!sessionId && !!firebaseUid && (options.enabled ?? true),
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
            if (error.status >= 400 && error.status < 500) return false;
            return failureCount < 2;
        },
        ...options
    });
};

export const useLogSet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logSet,
        onSuccess: (newlyLoggedSet) => {
            const sessionKey = sessionsKeys.detail(newlyLoggedSet.session_id);

            queryClient.setQueryData(sessionKey, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    logged_sets: [...oldData.logged_sets, newlyLoggedSet],
                };
            });
        },
    });
};

export const useLogRest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logRest,
        onSuccess: (newlyLoggedRest) => {
            // Optimistically update the session cache with the new rest log
            const sessionKey = sessionsKeys.detail(newlyLoggedRest.session_id);

            queryClient.setQueryData(sessionKey, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    // Make sure the logged_rests array exists, then add the new one
                    logged_rests: [...(oldData.logged_rests || []), newlyLoggedRest],
                };
            });
        },
    });
};

export const useFinishSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: finishSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sessionsKeys.active() });
        },
    });
};
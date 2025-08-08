import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getAuthHeaders } from '@/lib/apiClient';

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
const createSession = async ({ workoutId }) => {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/sessions', {
        method: 'POST',
        headers,
        body: JSON.stringify({ workoutId }),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to start workout session');
    }
    return res.json();
};

const getSessionById = async (sessionId) => {
    if (!sessionId) return null;
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/sessions/${sessionId}`, { headers });
    if (!res.ok) {
        const errorInfo = await res.json();
        const error = new Error(errorInfo.message || 'An error occurred while fetching the session.');
        error.status = res.status;
        throw error;
    }
    return res.json();
};

const logSet = async (setData) => {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/logged_sets', {
        method: 'POST',
        headers,
        body: JSON.stringify(setData),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to log set');
    }
    return res.json();
};

const logRest = async (restData) => {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/logged_rests', {
        method: 'POST',
        headers,
        body: JSON.stringify(restData),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to log rest period');
    }
    return res.json();
};

const finishSession = async (sessionId) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/sessions/${sessionId}/finish`, {
        method: 'PATCH',
        headers,
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to finish session');
    }
    return res.json();
};

const deleteSession = async (sessionId) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers,
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete session');
    }
    return true;
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
 * @param {object} options - Optional React Query options.
 */
export const useSessionDetails = (sessionId, options = {}) => {
    const { userProfile, userLoading } = useAuth();
    return useQuery({
        queryKey: sessionsKeys.detail(sessionId),
        queryFn: () => getSessionById(sessionId),
        enabled: !!sessionId && !!userProfile && !userLoading,
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
            const sessionKey = sessionsKeys.detail(newlyLoggedRest.session_id);

            queryClient.setQueryData(sessionKey, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
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

export const useDeleteSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sessionsKeys.active() });
        },
    });
};
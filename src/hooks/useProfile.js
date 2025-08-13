import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthHeaders } from '@/lib/apiClient';

const updateProfile = async (profileData) => {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileData),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile');
    }
    return res.json();
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (updatedProfile) => {
            console.log("Profile updated successfully:", updatedProfile);
        },
    });
};
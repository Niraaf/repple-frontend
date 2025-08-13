'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/authContext';
import { useUpdateProfile } from '@/hooks/useProfile';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, userProfile, userLoading } = useAuth();
    const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

    const [username, setUsername] = useState('');
    const [unitPreference, setUnitPreference] = useState('kg');

    useEffect(() => {
        if (userProfile) {
            setUsername(userProfile.username || '');
            setUnitPreference(userProfile.unit_preference || 'kg');
        }
    }, [userProfile]);

    const handleSave = async () => {
        const updatedData = {
            username: username,
            unit_preference: unitPreference,
        };

        const promise = updateProfile(updatedData);

        toast.promise(promise, {
            loading: 'Saving profile...',
            success: 'Profile updated successfully!',
            error: (err) => err.message || 'Failed to update profile.',
        });

        try {
            await promise;
        } catch (error) {
            console.error(error);
        }
    };

    if (userLoading || !userProfile || isPending) {
        return <div className="flex justify-center items-center h-screen animate-pulse">Loading profile...</div>
    }

    return (
        <div className="flex flex-col items-center p-6 pt-24 md:pt-32">
            <div className="w-full max-w-lg">
                <h1 className="text-3xl font-extrabold tracking-tight mb-6">Your Profile</h1>

                <div className="space-y-6 bg-white/30 p-6 rounded-lg shadow-md">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={user.email}
                            readOnly
                            className="w-full p-2 mt-1 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-600">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="unitPreference" className="block text-sm font-medium text-gray-600">Unit Preference</label>
                        <select
                            id="unitPreference"
                            value={unitPreference}
                            onChange={(e) => setUnitPreference(e.target.value)}
                            className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="kg">Kilograms (kg)</option>
                            <option value="lbs">Pounds (lbs)</option>
                        </select>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useUnsavedChanges } from "@/contexts/unsavedChangesContext";

export default function MobileNavModal({ onClose, userLoggedIn, currentUser, handleSignOut }) {
    const router = useRouter();
    const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedChanges();

    const confirmAndNavigate = (path) => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm("You have unsaved changes. Leave anyway?");
            if (!confirmed) return;
        }
        onClose();
        router.push(path);
    };

    return (
        <div
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm flex justify-center items-center"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white/50 backdrop-blur-xl w-72 p-6 rounded-2xl shadow-lg flex flex-col gap-6 animate-slide-up border-4 border-b-0 border-white/30"
            >
                {/* ✖ Close Button */}
                <button
                    onClick={onClose}
                    className="self-end text-gray-500 hover:text-gray-700 text-2xl transition"
                >
                    ✕
                </button>

                {/* 📚 Navigation */}
                <nav className="flex flex-col gap-4 text-gray-700 text-base font-medium">
                    <button onClick={() => confirmAndNavigate('/')} className="text-left hover:text-blue-500">Home</button>
                    <button onClick={() => confirmAndNavigate('/workouts')} className="text-left hover:text-blue-500">My Workouts</button>
                    <button onClick={() => confirmAndNavigate('/history')} className="text-left hover:text-blue-500">History</button>
                    <button onClick={() => confirmAndNavigate('/profile')} className="text-left hover:text-blue-500">Profile</button>
                </nav>

                {/* 🔒 Auth Buttons */}
                <div className="mt-8 flex flex-col gap-3">
                    {!userLoggedIn || currentUser?.isAnonymous ? (
                        <>
                            <button onClick={() => confirmAndNavigate('/login')} className="block text-center py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold transition">
                                Login
                            </button>
                            <button onClick={() => confirmAndNavigate('/register')} className="block text-center py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold transition">
                                Register
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                if (hasUnsavedChanges) {
                                    const confirmed = window.confirm("You have unsaved changes. Leave anyway?");
                                    if (!confirmed) return;
                                }
                                setHasUnsavedChanges(false);
                                onClose();
                                handleSignOut();
                            }}
                            className="block text-center py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold transition"
                        >
                            Sign Out
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

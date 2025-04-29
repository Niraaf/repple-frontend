'use client';

import Link from "next/link";

export default function MobileNavModal({ onClose, userLoggedIn, currentUser, handleSignOut }) {
    return (
        <div
            className="fixed inset-0 z-40 backdrop-blur-sm flex justify-center items-center"
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
                    <Link href="/" onClick={onClose} className="hover:text-blue-500">Home</Link>
                    <Link href="/workouts" onClick={onClose} className="hover:text-blue-500">My Workouts</Link>
                    <Link href="/history" onClick={onClose} className="hover:text-blue-500">History</Link>
                    <Link href="/profile" onClick={onClose} className="hover:text-blue-500">Profile</Link>
                </nav>

                {/* 🔒 Auth Buttons */}
                <div className="mt-8 flex flex-col gap-3">
                    {!userLoggedIn || currentUser?.isAnonymous ? (
                        <>
                            <Link href="/login" onClick={onClose} className="block text-center py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold transition">
                                Login
                            </Link>
                            <Link href="/register" onClick={onClose} className="block text-center py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold transition">
                                Register
                            </Link>
                        </>
                    ) : (
                        <button
                            onClick={() => { onClose(); handleSignOut(); }}
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

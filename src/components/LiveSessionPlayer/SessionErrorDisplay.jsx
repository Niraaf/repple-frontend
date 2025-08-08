'use client';
import Link from 'next/link';

export default function SessionErrorDisplay({ error }) {
    let title = "Error";
    let message = "Failed to load the session. Please try again later.";

    if (error?.status === 404) {
        title = "Session Not Found";
        message = "This session may have been deleted, or the link is incorrect.";
    } else if (error?.status === 403) {
        title = "Access Denied";
        message = "You do not have permission to view this session.";
    } else if (error?.status === 400) {
        title = "Invalid URL";
        message = "The session link is malformed.";
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-red-600 mb-2">{title}</h2>
                <p className="text-gray-500 mb-6">{message}</p>
                <Link href="/workouts" className="bg-purple-500 text-white font-bold py-2 px-4 rounded-full hover:bg-purple-600 transition">
                    Back to My Workouts
                </Link>
            </div>
        </div>
    );
};
"use client";

import Link from "next/link";

export const FinishedView = ({ sessionId }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center w-full min-h-screen p-6">
            <h1 className="text-4xl font-extrabold text-green-600 animate-pulse">Workout Complete!</h1>
            <p className="mt-4 text-gray-500">Amazing job. Your session has been saved.</p>
            <Link
                href={`/history/${sessionId}`}
                className="mt-8 bg-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-purple-700 transition"
            >
                View Session Summary
            </Link>
        </div>
    );
}
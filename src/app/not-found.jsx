"use client";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <h1 className="text-5xl font-bold mb-4">404 - Not Found</h1>
            <p className="text-gray-400 mb-6">Oops! The page you're looking for doesn't exist.</p>
            <Link
                href="/"
                className="bg-blue-400 hover:bg-blue-500 text-white px-6 py-2 rounded-full shadow transition"
            >
                Go Home
            </Link>
        </div>
    );
}

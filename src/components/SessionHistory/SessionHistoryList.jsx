'use client';
import { useUserSessions } from "@/hooks/useSession";
import SessionHistoryCard from "./SessionHistoryCard";
import { useAuth } from "@/contexts/authContext";

export default function SessionHistoryList({ initialSessions }) {
    const { user } = useAuth();
    // The hook is hydrated with the server-fetched data
    const { data: sessions, isLoading, isError } = useUserSessions(initialSessions);

    // This is the loading state for any subsequent client-side refetches
    if (isLoading && !initialSessions) {
        return <p className="text-lg text-gray-400 animate-pulse">Loading your history...</p>;
    }

    if (isError) {
        return <p className="text-red-500 text-center text-lg">Could not load workout history.</p>;
    }

    return (
        <div className="flex flex-col items-center gap-6 min-h-screen p-6 pt-24 md:pt-32 w-full">
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                    Workout History
                </h1>
                <p className="text-gray-400 text-xs md:text-sm">Review your completed sessions.</p>
            </div>
            <div className="flex flex-col gap-4 w-full max-w-3xl">
                {sessions && sessions.length > 0 ? (
                    sessions.map(session => <SessionHistoryCard key={session.id} session={session} />)
                ) : (
                    <p className="text-gray-500 text-center mt-8">You haven't completed any workouts yet.</p>
                )}
            </div>
        </div>
    );
}
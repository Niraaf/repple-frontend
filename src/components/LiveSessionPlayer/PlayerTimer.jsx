// src/components/LiveSessionPlayer/PlayerTimer.jsx
'use client';

export default function PlayerTimer({ seconds, isResting }) {
    const isOvertime = seconds < 0;

    const formatTime = (totalSeconds) => {
        const absSeconds = Math.abs(Math.ceil(totalSeconds));
        const mins = Math.floor(absSeconds / 60);
        const secs = absSeconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <h1 className={`text-9xl font-extrabold my-8 leading-none transition-colors duration-300 drop-shadow-md ${isOvertime ? "text-red-600 animate-pulse" : "text-gray-900"}`}>
            {formatTime(seconds)}
        </h1>
    );
}
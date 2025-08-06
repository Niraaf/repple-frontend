'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = () => {
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [seconds, setSeconds] = useState(0);

    const intervalRef = useRef(null);
    const startTimeRef = useRef(0);
    const initialDurationRef = useRef(0);

    const start = useCallback((duration = null) => {
        setIsActive(true);
        setIsPaused(false);
        startTimeRef.current = Date.now();
        initialDurationRef.current = duration;

        if (duration !== null) {
            setSeconds(duration);
        } else {
            setSeconds(0);
        }
    }, []);

    const pause = useCallback(() => {
        setIsActive(false);
        setIsPaused(true);
    }, []);

    const reset = useCallback(() => {
        setIsActive(false);
        setIsPaused(false);
        setSeconds(0);
        initialDurationRef.current = null;
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isActive && !isPaused) {
            intervalRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

                if (initialDurationRef.current !== null) {
                    // Countdown mode
                    const remaining = initialDurationRef.current - elapsed;
                    setSeconds(remaining);
                } else {
                    // Stopwatch mode
                    setSeconds(elapsed);
                }
            }, 500);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, isPaused, reset]);

    return { seconds, isActive, isPaused, start, pause, reset };
};
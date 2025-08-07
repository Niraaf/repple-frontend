'use client';

import { useEffect, useRef, useCallback } from 'react';

export const useTimer = ({ setSeconds, isActive, setIsActive }) => {
    const intervalRef = useRef(null);
    const startTimeRef = useRef(0);
    const initialDurationRef = useRef(0);

    const start = useCallback((duration = null) => {
        setIsActive(true);
        startTimeRef.current = Date.now();
        initialDurationRef.current = duration;
        setSeconds(duration ?? 0);
    }, [setIsActive, setSeconds]);

    const pause = useCallback(() => {
        setIsActive(false);
    }, [setIsActive]);

    const reset = useCallback(() => {
        setIsActive(false);
        setSeconds(0);
        initialDurationRef.current = null;
    }, [setIsActive, setSeconds]);
    
    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                if (initialDurationRef.current !== null) {
                    setSeconds(initialDurationRef.current - elapsed);
                } else {
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
    }, [isActive, setSeconds]);

    return { start, pause, reset };
};
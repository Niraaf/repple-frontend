'use client';

import { useEffect } from "react";

/**
 * A custom hook to dynamically change the body's theme class based on the player state.
 * @param {string} playerState - The current state of the workout player 
 * (e.g., 'ready', 'active_set', 'resting', 'logging', 'finished').
 */
export function useBlobTheme(playerState) {
    useEffect(() => {
        const themes = [
            'repple-default',
            'repple-ready',
            'repple-active_set',
            'repple-resting',
            'repple-logging',
            'repple-finished'
        ];

        const classToApply = `repple-${playerState}`;
        const finalThemeClass = themes.includes(classToApply) ? classToApply : 'repple-default';

        document.body.classList.remove(...themes);
        document.body.classList.add(finalThemeClass);

        return () => {
            document.body.classList.remove(finalThemeClass);
            document.body.classList.add('repple-default');
        };
    }, [playerState]);
}
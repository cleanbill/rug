// components/Timer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { RugbyGame } from '../types';

interface TimerProps {
    game: RugbyGame;
    onTimerUpdate: (newElapsedTime: number) => void;
}

const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function GameTimer({ game, onTimerUpdate }: TimerProps) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        // Timer only runs if the game has started and is not finished/paused
        const isRunning = game.startTime > 0 && !game.isFinished && game.pauseTime === null;

        if (isRunning) {
            interval = setInterval(() => {
                // Calculate current elapsed time based on absolute timestamps
                const newElapsed = Date.now() - game.startTime + game.elapsedTimeAtPause;

                setElapsed(newElapsed);
                onTimerUpdate(newElapsed); // Optional: if you need to sync back to parent state
            }, 1000);
        } else {
            // When paused or stopped, calculate the final elapsed time once
            setElapsed(game.elapsedTimeAtPause);
            if (interval) clearInterval(interval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [game.startTime, game.elapsedTimeAtPause, game.pauseTime, game.isFinished, onTimerUpdate]);

    return (
        <div className="w-full text-center py-4 px-2 mb-4 bg-white rounded-xl shadow-md border-b-4 border-indigo-500">
            <div className="text-sm text-gray-600 font-semibold uppercase">Elapsed Time:</div>
            <span className="text-5xl font-extrabold text-indigo-900 tracking-wider tabular-nums">
                {formatTime(elapsed)}
            </span>
        </div>
    );
}
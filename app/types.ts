// types.ts

export type ScoreType = 'try' | 'conversion' | 'penalty' | 'dropGoal';

// Data stored for each individual score event
export interface ScoreEvent {
    id: string; // UUID
    playerId: string;
    type: ScoreType;
    points: number;
    timestamp: number; // Time when the score was recorded (ms)
}

// The core data model for a single game
export interface RugbyGame {
    id: string;
    opponent: string;
    opponentScore: number;
    startTime: number; // Absolute timestamp (Date.now()) when the game started
    pauseTime: number | null; // Absolute timestamp if game is paused
    elapsedTimeAtPause: number; // The total elapsed time when paused
    isFinished: boolean;
    scoreEvents: ScoreEvent[];
    comments: string;
}

export interface AnimationData {
    type: 'TRY' | 'CONVERSION';
    startX: number;
    startY: number;
}

// Player data (can be simple array of names/IDs)
export const PLAYERS = [
    { id: 'p01', name: 'Ben' },
    { id: 'p02', name: 'Cory' },
    { id: 'p03', name: 'Declan' },
    { id: 'p04', name: 'Elmer' },
    { id: 'p05', name: 'George' },
    { id: 'p06', name: 'Jack B' },
    { id: 'p07', name: 'Jack E' },
    { id: 'p08', name: 'Joe' },
    { id: 'p09', name: 'Maksym' },
    { id: 'p10', name: 'Oscar' },
    { id: 'p11', name: 'Sam' },
    { id: 'p12', name: 'Spenser' },
    { id: 'p13', name: 'Sully' },
    { id: 'p14', name: 'Teddy' },
    { id: 'p15', name: 'Zeke' }
];

// Rugby Score Rules (U13 is often simplified)
export const RUGBY_RULES: Record<ScoreType, number> = {
    try: 5,
    conversion: 2,
    penalty: 3,
    dropGoal: 3,
};
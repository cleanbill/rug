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

export interface SubLogEntry {
    id: string;
    name: string;
    type: 'ON' | 'OFF';
    time: string;
}

export interface TackleLogEntry {
    id: string;
    name: string;
    time: string;
}

export interface ScoreLogEntry {
    id: string;
    name: string;
    type: string; // 'TRY' or 'CONVERSION'
    time: string;
}

export interface RugbyGame {
    id: string;
    opponent: string;
    opponentScore: number;
    startTime: number;
    pauseTime: number | null;
    elapsedTimeAtPause: number;
    isFinished: boolean;
    scoreEvents: ScoreEvent[];
    comments: string;
    home: boolean;
    tackles?: Record<string, number>;
    subHistory?: SubLogEntry[];
    playtimeTotals?: Record<string, number>;
    scoreHistory?: ScoreLogEntry[];
    tackleHistory?: TackleLogEntry[];
}

export interface AnimationData {
    type: 'TRY' | 'CONVERSION';
    startX: number;
    startY: number;
}

export type Player = {
    id: string;
    name: string;
}

// Player data (can be simple array of names/IDs)
export const PLAYERS: Array<Player> = [
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
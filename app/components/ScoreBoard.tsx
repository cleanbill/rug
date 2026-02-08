// components/Scoreboard.tsx
import ScoreUnit from './ScoreUnit';
import GameTimer from './Timer';
import { RugbyGame } from '../types';

interface ScoreboardProps {
    isHome: boolean;
    activeGame: RugbyGame;
    ourScore: number;
    onUndoOur: () => void;
    onUndoOpponent: () => void;
}

export default function Scoreboard({ isHome, activeGame, ourScore, onUndoOur, onUndoOpponent }: ScoreboardProps) {
    const ourUnit = <ScoreUnit score={ourScore} label="Southwell City" onUndo={onUndoOur} colourClass="text-green-600" />;
    const opponentUnit = <ScoreUnit score={activeGame.opponentScore} label={activeGame.opponent} onUndo={onUndoOpponent} colourClass="text-red-600" />;

    return (
        <div className="score-display text-center my-4 w-full grid grid-cols-3 h-30 items-center">
            {isHome ? ourUnit : opponentUnit}
            <span className="text-2xl font-bold tabular-nums w-38 justify-self-center">
                <GameTimer game={activeGame} onTimerUpdate={() => { }} />
            </span>
            {isHome ? opponentUnit : ourUnit}
        </div>
    );
}
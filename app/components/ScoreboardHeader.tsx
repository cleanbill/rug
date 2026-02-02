import ScoreUnit from "./ScoreUnit";
import GameTimer from "./Timer";

export const ScoreboardHeader = ({ isHome, activeGame, calculatedScore, onUndoOur, onUndoOpponent }: any) => (
    <div className="score-display text-center my-4 w-full grid grid-cols-3 h-30 justify-around items-center">
        <ScoreUnit
            score={isHome ? calculatedScore : activeGame.opponentScore}
            label={isHome ? 'Southwell City' : activeGame.opponent}
            onUndo={isHome ? onUndoOur : onUndoOpponent}
            colourClass={isHome ? 'text-green-600' : 'text-red-600'}
        />

        <span className="text-2xl font-bold tabular-nums w-38 justify-self-center">
            <GameTimer game={activeGame} onTimerUpdate={() => { }} />
        </span>

        <ScoreUnit
            score={isHome ? activeGame.opponentScore : calculatedScore}
            label={isHome ? activeGame.opponent : 'Southwell City'}
            onUndo={isHome ? onUndoOpponent : onUndoOur}
            colourClass={isHome ? 'text-red-600' : 'text-green-600'}
        />
    </div>
);
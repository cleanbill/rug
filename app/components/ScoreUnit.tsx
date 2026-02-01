interface ScoreUnitProps {
    score: number;
    label: string;
    onUndo: () => void;
    colourClass: string;
}

const ScoreUnit = ({ score, label, onUndo, colourClass: colourClass }: ScoreUnitProps) => (
    <div className="flex flex-col items-center mt-10">
        <h1 className="text-4xl font-black text-gray-800">
            <span className={colourClass}>{score}</span>
        </h1>
        <button
            onClick={onUndo}
            disabled={score === 0}
            className={`p-1 rounded-full text-white transition shadow-md 
        ${score > 0 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-300 cursor-not-allowed'}`}
            title={`Undo Last ${label} Score`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
        </button>
        <div className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-tight">
            {label}
        </div>
    </div>
);

export default ScoreUnit;
import { Player } from "../types";

interface PlayerGridProps {
    players: Player[];
    playingIds: string[];
    tackleCounts: Record<string, number>; // Add this
    toggleStatus: (id: string, name: string) => void;
    handleScore: (id: string, type: 'try' | 'conversion', e: React.MouseEvent<HTMLButtonElement>) => void;
    handleTackle: (id: string, e: React.MouseEvent) => void; // Add this
}

export const PlayerGrid = ({ players, playingIds, toggleStatus, handleScore, handleTackle, tackleCounts }: PlayerGridProps) => (
    <div className="grid grid-cols-2 gap-3 w-full max-w-xl mb-6">
        {players.map(player => {
            const isPlaying = playingIds.includes(player.id);
            const tackles = tackleCounts[player.id] || 0;

            return (
                <div
                    key={player.id}
                    className={`relative transition-all duration-200 p-3 rounded-lg bg-white ${isPlaying
                        ? "border-4 border-green-600 shadow-[4px_4px_0px_0px_rgba(22,101,52,1)]"
                        : "border-2 border-dashed border-gray-300 opacity-70"
                        }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <p className={`font-black text-sm truncate ${isPlaying ? 'text-black' : 'text-gray-400'}`}>
                            {player.name}
                        </p>

                        <button
                            onClick={() => toggleStatus(player.id, player.name)}
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase border-2 border-black ${isPlaying ? 'bg-red-400 text-black' : 'bg-green-400 text-black'
                                }`}
                        >
                            {isPlaying ? 'Off' : 'On'}
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={(e) => handleScore(player.id, 'try', e)}
                            disabled={!isPlaying}
                            className={`py-1.5 text-white text-xs font-black uppercase rounded shadow-sm transition-transform active:scale-95 ${isPlaying ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'
                                }`}
                        >
                            Try
                        </button>

                        <button
                            onClick={(e) => handleTackle(player.id, e)}
                            disabled={!isPlaying}
                            className={`py-1.5 text-xs font-black uppercase rounded border-2 border-black transition-transform active:scale-95 ${isPlaying ? 'bg-yellow-400 hover:bg-yellow-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-gray-200 text-gray-400 border-gray-300'
                                }`}
                        >
                            Tkl: {tackles}
                        </button>
                    </div>
                </div>
            );
        })}
    </div>
);
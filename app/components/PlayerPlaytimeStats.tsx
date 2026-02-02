import { FC } from "react";
import { PLAYERS } from "../types";

interface Player {
    id: string;
    name: string;
}

interface PlayerPlaytimeStatsProps {
    playTimes: Record<string, number>;
    playingIds: string[];
    players: Player[];
    tackleCounts: Record<string, number>;
}
const PlayerPlaytimeStats: FC<PlayerPlaytimeStatsProps> = ({
    playTimes,
    playingIds,
    tackleCounts,
    players
}) => {

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs.toString().padStart(2, '0')}s`;
    };


    return (
        <div className="mt-8 bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 max-w-xl w-full border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                Player Participation
                <span className="text-xs text-blue-500 font-medium bg-blue-50 px-3 py-1 rounded-full uppercase">Live Stats</span>
            </h2>

            <div className="space-y-4">
                {players.map(player => {
                    const isPlaying = playingIds.includes(player.id);
                    const totalSeconds = playTimes[player.id] || 0;
                    const tackles = tackleCounts[player.id] || 0;

                    return (
                        <div key={player.id} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-2xl transition-all">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                    <span className="font-bold text-gray-700">{player.name}</span>
                                    {tackles > 0 && (
                                        <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                            {tackles} TKL
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm font-mono font-bold text-gray-600">
                                    {formatTime(totalSeconds)}
                                </span>
                            </div>

                            {/* Progress bar to visualize "Game Load" */}
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${isPlaying ? 'bg-green-400' : 'bg-gray-400 opacity-50'}`}
                                    style={{ width: `${Math.min((totalSeconds / 2400) * 100, 100)}%` }} // Assuming 40 min game
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PlayerPlaytimeStats;
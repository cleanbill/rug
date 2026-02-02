'use client';
import React, { useState } from 'react';
import { RugbyGame, PLAYERS } from '../types';
import ScoreLog from './ScoreLog';
import SubstitutionLog from './SubstitutionLog';
import TackleLog from './TackleLog';

interface HistoryViewerProps {
    games: RugbyGame[];
    setGames: React.Dispatch<React.SetStateAction<RugbyGame[]>>;
}

export default function HistoryViewer({ games, setGames }: HistoryViewerProps) {
    const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

    const deleteGame = (id: string) => {
        if (confirm('Are you sure you want to delete this game record?')) {
            setGames(prev => prev.filter(g => g.id !== id));
        }
    };

    const getTopTackler = (tackles: Record<string, number> | undefined) => {
        if (!tackles || Object.keys(tackles).length === 0) return "N/A";
        const topId = Object.keys(tackles).reduce((a, b) => (tackles[a] > tackles[b] ? a : b));
        const count = tackles[topId];
        const player = PLAYERS.find(p => p.id === topId);
        return player ? `${player.name} (${count})` : `Unknown (${count})`;
    };

    const calculateOurScore = (game: RugbyGame) => {
        return game.scoreEvents.reduce((total, event) => total + event.points, 0);
    };

    return (
        <div className="w-full space-y-4">
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-4">Match History</h2>

            {games.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                    <p className="text-gray-400 font-medium">No matches recorded yet.</p>
                </div>
            ) : (
                games.map((game) => {
                    const ourScore = calculateOurScore(game);
                    const isExpanded = expandedGameId === game.id;
                    const isWin = ourScore > game.opponentScore;

                    return (
                        <div
                            key={game.id}
                            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all"
                        >
                            {/* Main Summary Bar */}
                            <div
                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                                onClick={() => setExpandedGameId(isExpanded ? null : game.id)}
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        {new Date(game.startTime).toLocaleDateString()}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-lg font-black ${isWin ? 'text-green-600' : 'text-gray-800'}`}>
                                            {game.home ? 'Southwell' : game.opponent} {game.home ? ourScore : game.opponentScore}
                                        </span>
                                        <span className="text-gray-300 font-bold">vs</span>
                                        <span className="text-lg font-black text-gray-800">
                                            {game.home ? game.opponentScore : ourScore} {game.home ? game.opponent : 'Southwell'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isWin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {isWin ? 'Win' : 'Loss/Draw'}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteGame(game.id); }}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Stats Section */}
                            {isExpanded && (
                                <div className="p-5 bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <StatBox label="Top Tackler" value={getTopTackler(game.tackles)} />
                                        <StatBox label="Substitutions" value={game.subHistory?.length || 0} />
                                        <StatBox label="Our Tries" value={game.scoreEvents.filter(e => e.type === 'try').length} />
                                        <StatBox label="Location" value={game.home ? "Home" : "Away"} />
                                    </div>

                                    {game.comments && (
                                        <div className="mb-4 bg-white p-3 rounded-2xl border border-gray-100 italic text-gray-600 text-sm">
                                            "{game.comments}"
                                        </div>
                                    )}

                                    <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ScoreLog history={game.scoreHistory || []} />
                                        <TackleLog history={game.tackleHistory || []} />
                                        <div className="md:col-span-2">
                                            <SubstitutionLog history={game.subHistory || []} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}

function StatBox({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{label}</p>
            <p className="text-sm font-black text-gray-800 truncate">{value}</p>
        </div>
    );
}
'use client';

import { useState } from 'react';
import { RugbyGame, ScoreEvent, PLAYERS } from '../types';

interface HistoryViewerProps {
    games: RugbyGame[];
    setGames: (updater: (prevGames: RugbyGame[]) => RugbyGame[]) => void;
}

// Helper function to calculate total score for one game
const calculateTotalScore = (events: ScoreEvent[]): number => {
    return events.reduce((total, event) => total + event.points, 0);
};

// Helper to format duration
const formatDuration = (elapsedTimeAtPause: number): string => {
    const finalElapsedTime = elapsedTimeAtPause;
    const totalSeconds = Math.floor(finalElapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function HistoryViewer({ games, setGames }: HistoryViewerProps) {
    const [editingGameId, setEditingGameId] = useState<string | null>(null);
    const [currentComment, setCurrentComment] = useState('');

    const handleEditComment = (game: RugbyGame) => {
        setEditingGameId(game.id);
        setCurrentComment(game.comments || '');
    };

    const handleDeleteGame = (gameId: string) => {
        setGames(prevGames =>
            prevGames.filter(game => game.id !== gameId)
        );
        setEditingGameId(null);
        setCurrentComment('');

    }

    const handleSaveComment = (gameId: string) => {
        setGames(prevGames =>
            prevGames.map(game =>
                game.id === gameId ? { ...game, comments: currentComment } : game
            )
        );
        setEditingGameId(null);
        setCurrentComment('');
    };

    if (!games || games.length === 0) {
        return (
            <div className="text-center p-4 bg-white rounded-xl shadow-md border-gray-200 border">
                <p className="text-gray-500 font-medium">No completed games yet.</p>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">🏉 Game History</h2>

            {games.map((game) => {
                const totalScore = calculateTotalScore(game.scoreEvents);
                const gameDate = new Date(game.startTime).toLocaleDateString();
                const duration = formatDuration(game.elapsedTimeAtPause);
                const finalScoreDifference = totalScore - game.opponentScore;

                return (
                    <div
                        key={game.id}
                        className="bg-white p-4 rounded-xl shadow-md mb-4 border-l-4 border-indigo-400"
                    >
                        <div className="game-summary border-b pb-3 mb-3 flex justify-between items-center">
                            <div>
                                <strong className="text-lg text-gray-900 block truncate">{game.opponent} Match</strong>
                                <span className="text-sm text-gray-500">{gameDate} | Duration: {duration}</span>
                            </div>
                            <div
                                className={`px-3 py-1 rounded-full text-white font-bold text-lg 
                                ${finalScoreDifference > 0 ? 'bg-green-600' : finalScoreDifference < 0 ? 'bg-red-600' : 'bg-gray-500'}`}
                            >
                                {totalScore} - {game.opponentScore}
                            </div>
                        </div>

                        <details className="text-sm text-gray-600 mt-2">
                            <summary className="font-semibold cursor-pointer hover:text-indigo-600 transition">View Scoring Breakdown</summary>
                            <ul className="list-disc list-inside mt-2 space-y-1 bg-gray-50 p-3 rounded-lg">
                                {game.scoreEvents.map((event, index) => {
                                    const scorer = PLAYERS.find(p => p.id === event.playerId)?.name || 'Unknown Player';
                                    const time = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    return (
                                        <li key={index}>
                                            <span className="font-medium text-gray-800">{time}</span>: {scorer} scored a {event.type} (+{event.points})
                                        </li>
                                    );
                                })}
                            </ul>
                        </details>

                        <div className="comments-area pt-3 mt-3 border-t border-gray-200">
                            {editingGameId === game.id ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={currentComment}
                                        onChange={(e) => setCurrentComment(e.target.value)}
                                        rows={3}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="Add your post-game notes here..."
                                    />
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleSaveComment(game.id)}
                                            className="px-3 py-1 bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-600 transition"
                                        >
                                            Save Notes
                                        </button>
                                        <button
                                            onClick={() => setEditingGameId(null)}
                                            className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md text-sm hover:bg-gray-400 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-gray-700 mb-2">
                                        <strong>Notes:</strong> {game.comments || <em className="text-gray-500">No notes added.</em>}
                                    </p>
                                    <button
                                        onClick={() => handleEditComment(game)}
                                        className="px-3 py-1 bg-gray-100 border border-gray-300 text-sm text-gray-700 rounded-md hover:bg-gray-200 transition"
                                    >
                                        {game.comments ? 'Edit Notes' : '➕ Add Notes'}
                                    </button>
                                    <button onClick={() => handleDeleteGame(game.id)} className='float-right rounded-xl bg-red-300 w-6 h-6 text-xs'>X</button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
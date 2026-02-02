'use client';
import React from 'react';

interface ScoreLogProps {
    history: { id: string; name: string; type: string; time: string }[];
}

export default function ScoreLog({ history }: ScoreLogProps) {
    return (
        <div className="mt-6 bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 max-w-xl w-full border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="p-2 bg-green-50 rounded-lg text-green-600">🏉</span>
                    Try Log
                </h2>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">
                    Timeline
                </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                {history.length === 0 ? (
                    <p className="text-center py-6 text-gray-400 text-sm italic">No points scored yet.</p>
                ) : (
                    history.map((log) => (
                        <div
                            key={log.id}
                            className="flex items-center justify-between p-3 bg-green-50/40 rounded-2xl border border-green-100"
                        >
                            <div className="flex flex-col">
                                <span className="font-black text-gray-800 uppercase text-xs">{log.type}</span>
                                <span className="font-bold text-gray-600">{log.name}</span>
                            </div>
                            <span className="text-xs font-medium text-gray-400 tabular-nums">{log.time}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
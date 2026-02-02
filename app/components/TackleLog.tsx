'use client';
import React from 'react';
import { TackleLogEntry } from '../types';

interface TackleLogProps {
    history: TackleLogEntry[];
}

export default function TackleLog({ history }: TackleLogProps) {
    return (
        <div className="mt-6 bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 max-w-xl w-full border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="p-2 bg-yellow-50 rounded-xl text-yellow-600">🛡️</span>
                    Tackle Log
                </h2>
                <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full uppercase">
                    Total: {history.length}
                </span>
            </div>

            {/* List Container */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {history.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-400 text-sm italic">No tackles recorded yet.</p>
                        <p className="text-[10px] text-gray-300 uppercase mt-1">Defense wins championships!</p>
                    </div>
                ) : (
                    history.map((log) => (
                        <div
                            key={log.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-yellow-50/30"
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-700">{log.name}</span>
                                <span className="text-[10px] font-black text-yellow-600 uppercase tracking-tighter">
                                    Successful Tackle
                                </span>
                            </div>
                            <span className="text-xs font-medium text-gray-400 tabular-nums">
                                {log.time}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
export default function SubstitutionLog({ history }: { history: any[] }) {
    return (
        <div className="mt-8 bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 max-w-xl w-full border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="p-2 bg-blue-50 rounded-lg text-blue-600">🕒</span>
                    Substitution History
                </h2>
                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    {history.length} entries
                </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                {history.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 text-sm">No moves recorded yet.</p>
                    </div>
                ) : (
                    history.map((log) => (
                        <div
                            key={log.id}
                            className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-4">
                                {/* Minimalist Status Indicator */}
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${log.type === 'ON'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${log.type === 'ON' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    {log.type}
                                </div>

                                <span className="font-semibold text-gray-700">{log.name}</span>
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
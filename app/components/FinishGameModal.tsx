interface FinishGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    comment: string;
    setComment: (comment: string) => void;
    finalScore: number;
}

export default function FinishGameModal({
    isOpen,
    onClose,
    onSave,
    comment,
    setComment,
    finalScore,
}: FinishGameModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 transition-opacity duration-300">
            <div className="bg-white rounded-xl p-6 m-4 w-11/12 max-w-md shadow-2xl transform scale-100 transition-transform duration-300">

                <h3 className="text-2xl font-bold text-gray-800 mb-4">Match Finished!</h3>

                <div className="mb-4 text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-medium">Final Score:</p>
                    <p className={`text-4xl font-extrabold ${finalScore > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {finalScore}
                    </p>
                </div>

                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                    Add Post-Game Notes:
                </label>
                <textarea
                    id="comments"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="e.g., Good effort from Player C. Need to work on defense at the breakdown."
                />

                <div className="flex justify-between mt-6 space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
                    >
                        Cancel & Keep Active
                    </button>
                    <button
                        onClick={onSave}
                        className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-md"
                    >
                        Save & Finalize Game
                    </button>
                </div>
            </div>
        </div>
    );
}
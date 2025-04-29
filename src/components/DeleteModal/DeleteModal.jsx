export default function DeleteModal({ onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md" onClick={onCancel}>
            <div
                className="bg-white p-8 rounded-xl shadow-xl max-w-sm w-[90%] relative animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold mb-4 text-gray-800 text-center">Delete this workout?</h2>
                <p className="text-sm text-gray-500 mb-6 text-center">This action cannot be undone.</p>

                <div className="flex justify-center gap-4">
                    <button
                        className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

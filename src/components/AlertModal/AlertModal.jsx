export default function AlertModal({ isOpen, onClose, title, message, buttonText = "OK" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm flex justify-center items-center" onClick={onClose}>
            <div
                className="bg-white/50 border-4 border-b-0 border-white/30 p-8 rounded-xl shadow-xl max-w-sm w-[90%] relative animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold mb-4 text-gray-800 text-center">{title}</h2>
                <p className="text-sm text-gray-500 mb-6 text-center">{message}</p>

                <div className="flex justify-center">
                    <button
                        className="px-8 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition cursor-pointer"
                        onClick={onClose}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
}
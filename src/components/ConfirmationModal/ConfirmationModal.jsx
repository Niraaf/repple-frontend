export default function ConfirmationModal({
    isOpen,
    onConfirm,
    onCancel,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "default"
}) {
    if (!isOpen) return null;

    const confirmButtonStyles = {
        destructive: "px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition cursor-pointer",
        positive: "px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition cursor-pointer",
        default: "px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition cursor-pointer",
    };

    return (
        <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm flex justify-center items-center" onClick={onCancel}>
            <div
                // Your custom classes, including animate-fade-in, are preserved here.
                className="bg-white/50 border-4 border-b-0 border-white/30 p-8 rounded-xl shadow-xl max-w-sm w-[90%] relative animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold mb-4 text-gray-800 text-center">{title}</h2>
                {description && <p className="text-sm text-gray-500 mb-6 text-center">{description}</p>}

                <div className="flex justify-center gap-4">
                    <button
                        className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition cursor-pointer"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={confirmButtonStyles[confirmVariant]}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
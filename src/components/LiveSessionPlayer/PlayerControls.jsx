'use client';

export default function PlayerControls({ playerState, onAdvanceState }) {
    const renderButton = () => {
        switch (playerState) {
            case 'active_set':
                return (
                    <button
                        onClick={() => onAdvanceState({ type: 'FINISH_SET' })}
                        className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition transform hover:scale-105 cursor-pointer"
                    >
                        ✅ Finish Set
                    </button>
                );
            case 'resting':
                return (
                    <button
                        onClick={() => onAdvanceState({ type: 'FINISH_REST' })}
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition transform hover:scale-105 cursor-pointer"
                    >
                        Skip Rest & Start Next Set
                    </button>
                );
            case 'finished':
                return (
                    <button
                        // This would navigate to the summary page
                        onClick={() => alert("Navigate to summary page!")}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition transform hover:scale-105 cursor-pointer"
                    >
                        🎉 View Summary
                    </button>
                );
            default:
                // No primary action button for 'ready' or 'logging' states
                return null;
        }
    };

    return (
        <div className="mt-8 h-16">
            {renderButton()}
        </div>
    );
}
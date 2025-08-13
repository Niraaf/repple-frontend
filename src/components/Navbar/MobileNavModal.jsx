'use client';

export default function MobileNavModal({ onClose, userLoggedIn, handleSignOut, navigate }) {
    // We use the same confirmation hook here for a consistent UX.

    // The navigate function is now passed from the parent Navbar,
    // so we don't need to duplicate the logic here.
    const handleNavClick = (path) => {
        onClose(); // Close the modal first
        navigate(path);
    };

    const handleSignOutClick = () => {
        onClose();
        handleSignOut();
    };

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm flex justify-center items-center"
                onClick={onClose}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white/50 backdrop-blur-xl w-72 p-6 rounded-2xl shadow-lg flex flex-col gap-6 animate-slide-up border-4 border-b-0 border-white/30"
                >
                    <button onClick={onClose} className="self-end text-gray-500 hover:text-gray-700 text-2xl transition">
                        ✕
                    </button>

                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-4 text-gray-700 text-base font-medium">
                        <button onClick={() => handleNavClick('/dashboard')} className="text-left hover:text-blue-500">Dashboard</button>
                        <button onClick={() => handleNavClick('/workouts')} className="text-left hover:text-blue-500">My Workouts</button>
                        <button onClick={() => handleNavClick('/history')} className="text-left hover:text-blue-500">History</button>
                        <button onClick={() => handleNavClick('/profile')} className="text-left hover:text-blue-500">Profile</button>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="mt-8 flex flex-col gap-3">
                        {!userLoggedIn ? (
                            <>
                                <button onClick={() => handleNavClick('/login')} className="block text-center py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold transition">
                                    Login
                                </button>
                                <button onClick={() => handleNavClick('/register')} className="block text-center py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold transition">
                                    Register
                                </button>
                            </>
                        ) : (
                            <button onClick={handleSignOutClick} className="block text-center py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold transition">
                                Sign Out
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
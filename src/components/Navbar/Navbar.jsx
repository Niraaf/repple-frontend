'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from 'nextjs-toploader/app';
import { useUnsavedChanges } from "@/contexts/unsavedChangesContext";
import { useConfirmationModal } from "@/hooks/useConfirmationModal";
import MobileNavModal from "./MobileNavModal";
import { doSignOut } from "@/supabase/auth";

export default function Navbar() {
    const { userLoggedIn } = useAuth();
    const { showConfirmation, ConfirmationModalComponent } = useConfirmationModal();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const router = useRouter();
    const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedChanges();

    const navigateWithConfirmation = async (path) => {
        if (hasUnsavedChanges) {
            const confirmed = await showConfirmation({
                title: "Unsaved Changes",
                description: "You have unsaved changes. Are you sure you want to leave?",
                confirmText: "Leave",
                confirmVariant: "destructive",
            });
            if (!confirmed) return;
        }
        setMenuOpen(false);
        router.push(path);
    };

    const handleBack = async () => {
        if (hasUnsavedChanges) { /* ... same as before ... */ }
        else { router.back(); }
    };

    const handleSignOut = async () => {
        if (isSigningOut) return;
        if (hasUnsavedChanges) {
            const confirmed = await showConfirmation({
                title: "Unsaved Changes",
                description: "You have unsaved changes. Are you sure you want to sign out?",
                confirmText: "Sign Out",
                confirmVariant: "destructive",
            });
            if (!confirmed) return;
        }
        setIsSigningOut(true);
        try {
            await doSignOut(); // <-- Use the new Supabase sign out function
            setHasUnsavedChanges(false);
            router.push("/");
        } catch (err) {
            console.error("Sign out failed:", err);
        } finally {
            setIsSigningOut(false);
        }
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLinkClick = (e, path) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            navigateWithConfirmation(path);
        } else {
            setMenuOpen(false);
        }
    };

    return (
        <>
            <header
                className={`fixed top-0 left-1/2 transform -translate-x-1/2 w-[94%] max-w-6xl px-4 py-3 z-30 rounded-b-4xl backdrop-blur-md 
                    ${isScrolled ? "shadow-lg bg-white/50" : ""} 
                    transition-all duration-300 ease-in-out flex items-center justify-between
                `}
            >
                {/* LEFT SIDE */}
                <div className="flex items-center gap-3">
                    <button onClick={handleBack} className="bg-white/70 hover:bg-white text-gray-700 w-8 h-8 text-xs rounded-full p-2 shadow-md transition cursor-pointer">
                        ←
                    </button>
                    <div className="text-base md:text-lg font-bold text-gray-800">
                        <span className="text-blue-600">Repple</span>
                    </div>
                </div>

                {/* MIDDLE - Desktop Nav */}
                <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
                    <Link href="/dashboard" onClick={(e) => handleLinkClick(e, '/dashboard')} className="hover:text-blue-500 transition-colors cursor-pointer">Dashboard</Link>
                    <Link href="/workouts" onClick={(e) => handleLinkClick(e, '/workouts')} className="hover:text-blue-500 transition-colors cursor-pointer">My Workouts</Link>
                    <Link href="/history" onClick={(e) => handleLinkClick(e, '/history')} className="hover:text-blue-500 transition-colors cursor-pointer">History</Link>
                    <Link href="/profile" onClick={(e) => handleLinkClick(e, '/profile')} className="hover:text-blue-500 transition-colors cursor-pointer">Profile</Link>
                </nav>

                {/* RIGHT SIDE */}
                <div className="flex items-center space-x-3">
                    <div className="hidden md:flex space-x-3 text-sm">
                        {!userLoggedIn ? (
                            <>
                                <Link href="/login" onClick={(e) => handleLinkClick(e, '/login')} className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer">
                                    Login
                                </Link>
                                <Link href="/register" onClick={(e) => handleLinkClick(e, '/register')} className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer">
                                    Register
                                </Link>
                            </>
                        ) : (
                            <button onClick={handleSignOut} disabled={isSigningOut} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold px-5 py-2 rounded-full shadow-md transition cursor-pointer disabled:opacity-50">
                                {isSigningOut ? "Signing out..." : "Sign Out"}
                            </button>
                        )}
                    </div>
                    <button onClick={() => setMenuOpen(true)} className="md:hidden px-2 bg-white/70 rounded-full shadow">
                        ☰
                    </button>
                </div>
            </header>

            {ConfirmationModalComponent}

            {menuOpen && (
                <MobileNavModal
                    onClose={() => setMenuOpen(false)}
                    userLoggedIn={userLoggedIn}
                    handleSignOut={handleSignOut}
                    navigate={navigateWithConfirmation}
                />
            )}
        </>
    );
}
'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/authContext";
import { doSignOut } from "@/firebase/auth";
import { usePathname, useRouter } from 'next/navigation';
import MobileNavModal from "../MobileNavModal/MobileNavModal";

export default function Header() {
    const { userLoggedIn, currentUser } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [visible, setVisible] = useState(true);

    const router = useRouter();
    const pathname = usePathname();

    const handleBack = () => {
        if (pathname === '/' || pathname === '') {
            router.push('/'); // already at root, stay
            return;
        }

        // Remove the last segment
        const segments = pathname.split('/').filter(Boolean); // filter(Boolean) removes empty strings
        segments.pop(); // remove last part

        const newPath = '/' + segments.join('/');
        router.push(newPath || '/'); // fallback to root if empty
    };

    const handleSignOut = async () => {
        if (!isSigningOut) {
            setIsSigningOut(true);
            try {
                await doSignOut();
                window.location.href = "/";
            } catch (err) {
                console.error(err);
            } finally {
                setIsSigningOut(false);
            }
        }
    };

    const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <>
            <header
                className={`fixed top-0 left-1/2 transform -translate-x-1/2 w-[94%] max-w-5xl px-4 py-3 z-30 rounded-b-4xl backdrop-blur-md 
                    ${isScrolled ? "shadow-lg" : ""} 
                    transition-all duration-300 ease-in-out flex items-center justify-between
                `}
            >
                {/* LEFT SIDE */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="bg-white/70 hover:bg-white text-gray-700 w-8 h-8 text-xs rounded-full p-2 shadow-md transition cursor-pointer"
                    >
                        ←
                    </button>

                    <div className="text-base md:text-lg font-bold text-gray-800">
                        <span className="text-blue-600">Repple</span>
                    </div>
                </div>

                {/* MIDDLE - Desktop Nav */}
                <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
                    <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
                    <Link href="/workouts" className="hover:text-blue-500 transition-colors">My Workouts</Link>
                    <Link href="/history" className="hover:text-blue-500 transition-colors">History</Link>
                    <Link href="/profile" className="hover:text-blue-500 transition-colors">Profile</Link>
                </nav>

                {/* RIGHT SIDE */}
                <div className="flex items-center space-x-3">
                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex space-x-3">
                        {!userLoggedIn || currentUser?.isAnonymous ? (
                            <>
                                <Link href="/login" className="px-3 py-1 text-white bg-blue-500 rounded-full hover:bg-blue-600 transition">
                                    Login
                                </Link>
                                <Link href="/register" className="px-3 py-1 text-white bg-green-500 rounded-full hover:bg-green-600 transition">
                                    Register
                                </Link>
                            </>
                        ) : (
                            <button
                                onClick={handleSignOut}
                                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 
                                text-white font-bold px-5 py-1 rounded-full shadow-md transition cursor-pointer"
                            >
                                Sign Out
                            </button>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 bg-white/70 rounded-full shadow">
                        ☰
                    </button>
                </div>


            </header>
            {/* Mobile Menu Modal */}
            {menuOpen && (
                <MobileNavModal
                    onClose={() => setMenuOpen(false)}
                    userLoggedIn={userLoggedIn}
                    currentUser={currentUser}
                    handleSignOut={handleSignOut}
                />
            )}
        </>
    );
}

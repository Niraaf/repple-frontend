'use client';

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useAuth } from "@/contexts/authContext";
import { doSignOut } from "@/firebase/auth";

export default function Header() {
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [error, setError] = useState(null);
    const { userLoggedIn, currentUser } = useAuth();

    const handleSignOut = async (e) => {
        e.preventDefault();
        if (!isSigningOut) {
            setIsSigningOut(true);
            setError(null);
            try {
                await doSignOut();
                window.location.href = "/";
            } catch (err) {
                setError(err.message);
            } finally {
                setIsSigningOut(false);
            }
        }
    }

    {/* State to manage visibility and scroll positions */ }
    const [isScrolled, setIsScrolled] = useState(false);
    const [visible, setVisible] = useState(true);

    const prevScrollY = useRef(0);
    const currScrollY = useRef(0);
    const mouseNearTopRef = useRef(false);

    const handleScroll = () => {
        const currentScrollY = window.scrollY;

        // 🌫️ Handle background change
        setIsScrolled(currentScrollY > 50);

        // 👻 Handle visibility
        if (currentScrollY < 100) {
            setVisible(true);
        } else if (currentScrollY > prevScrollY.current && !mouseNearTopRef.current) {
            setVisible(false);  // Scrolling down, hide
        } else if (currentScrollY < prevScrollY.current) {
            setVisible(true);   // Scrolling up, show
        }

        prevScrollY.current = currScrollY.current;
        currScrollY.current = currentScrollY;
    };

    const handleMouseMove = (event) => {
        const dynamicMargin = Math.max(50, window.innerWidth * .1);

        if (event.clientY < 100 && event.clientX > dynamicMargin && event.clientX < window.innerWidth - dynamicMargin) {
            mouseNearTopRef.current = true;
            setVisible(true);   // Mouse near top, always show
        } else {
            mouseNearTopRef.current = false;

            if (currScrollY.current > prevScrollY.current && currScrollY.current > 50) {
                setVisible(false);  // Hide again if scrolling down
            }
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <header
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-5xl px-6 py-4 z-30 rounded-full 
              backdrop-blur-md bg-white/50 transition-all duration-300 ease-in-out 
              ${isScrolled ? "bg-white shadow-lg" : "bg-white/30"} ${visible ? "translate-y-0" : "-translate-y-[200%]"}`}
        >
            <div className="flex justify-between items-center">
                {/* Logo */}
                <div className="text-lg font-bold text-gray-800">
                    <span className="text-blue-600">Repple</span>
                </div>

                {/* Nav */}
                <nav className="flex space-x-6 text-sm font-medium text-gray-700">
                    <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
                    <Link href="/workouts" className="hover:text-blue-500 transition-colors">My Workouts</Link>
                    <Link href="/history" className="hover:text-blue-500 transition-colors">History</Link>
                    <Link href="/profile" className="hover:text-blue-500 transition-colors">Profile</Link>
                </nav>


                {/* Auth Buttons */}
                {!userLoggedIn || currentUser?.isAnonymous ? (
                    <div className="flex space-x-3">
                        <Link href="/login" className="px-3 py-1 text-white bg-blue-500 rounded-full text-xs hover:bg-blue-600 transition">
                            Login
                        </Link>
                        <Link href="/register" className="px-3 py-1 text-white bg-green-500 rounded-full text-xs hover:bg-green-600 transition">
                            Register
                        </Link>
                    </div>
                ) : (
                    <button
                        onClick={handleSignOut}
                        className="px-3 py-1 text-white bg-green-500 rounded-full text-xs hover:bg-green-600 transition"
                    >
                        Sign Out
                    </button>
                )}
            </div>
        </header>

    );
}

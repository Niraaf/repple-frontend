'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useAuth } from "@/contexts/authContext";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const { userLoggedIn } = useAuth();

    // Change header background on scroll
    const handleScroll = () => {
        if (window.scrollY > 50) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 w-full p-4 z-50 transition-all duration-300 ease-in-out ${isScrolled ? "bg-white shadow-md" : "bg-transparent"
                }`}
        >
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo / Brand */}
                <div className="text-xl font-bold text-gray-900">
                    <span className="text-blue-600">MyApp</span>
                </div>

                {/* Navigation Links */}
                <nav>
                    <ul className="flex space-x-6">
                        <li>
                            <Link href="#home" className="text-lg text-gray-900 hover:text-blue-600 transition-colors">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="#about" className="text-lg text-gray-900 hover:text-blue-600 transition-colors">
                                About
                            </Link>
                        </li>
                        <li>
                            <Link href="#projects" className="text-lg text-gray-900 hover:text-blue-600 transition-colors">
                                Projects
                            </Link>
                        </li>
                        <li>
                            <Link href="#contact" className="text-lg text-gray-900 hover:text-blue-600 transition-colors">
                                Contact
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Authentication Buttons */}
                {
                    userLoggedIn
                        ?
                        <div className="flex space-x-4">
                            <Link href="/login" className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300">
                                Login
                            </Link>
                            <Link href="/register" className="px-4 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 transition duration-300">
                                Register
                            </Link>
                        </div>
                        :
                        <div></div>
                }
            </div>
        </header>
    );
}

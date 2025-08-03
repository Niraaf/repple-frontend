"use client";

import "./globals.css";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/authContext";
import { UnsavedChangesProvider } from "@/contexts/unsavedChangesContext";
import Navbar from "@/components/Navbar/Navbar";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Space_Mono } from 'next/font/google';
import { useBlobTheme } from "@/hooks/useBlobTheme";

const spaceMono = Space_Mono({
    subsets: ["latin"],
    weight: ["400", "700"],
});

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
    useBlobTheme("default");

    return (
        <html lang="en">
            <body className={`min-h-screen relative bg-fixed font-mono ${spaceMono.className}`}>

                {/* 🌈 Blobs Container */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-default" />
                    <div className="absolute inset-0 bg-gradient-rest" />
                    <div className="absolute inset-0 bg-gradient-exercise" />

                    <div className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full opacity-30 blur-3xl animate-float-slow bg-blob-1 transition-colors duration-700" />
                    <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full opacity-30 blur-3xl animate-float-slower bg-blob-2 transition-colors duration-700" />
                    <div className="absolute top-1/3 left-1/2 w-80 h-80 rounded-full opacity-20 blur-3xl animate-float bg-blob-3 transition-colors duration-700" />
                </div>

                {/* Main Content */}
                <AuthProvider>
                    <QueryClientProvider client={queryClient}>
                        <UnsavedChangesProvider>
                            <Navbar />
                            {children}
                        </UnsavedChangesProvider>
                    </QueryClientProvider>
                </AuthProvider>
            </body>
        </html>
    );
}


"use client";

import "./globals.css";
import { AuthProvider } from "@/contexts/authContext";
import { UnsavedChangesProvider } from "@/contexts/unsavedChangesContext";
import Navbar from "@/components/Navbar/Navbar";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Space_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import BlobBackground from "@/components/BlobBackground/BlobBackground";

const spaceMono = Space_Mono({
    subsets: ["latin"],
    weight: ["400", "700"],
});

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
    // DO NOT call hooks here. This is a Server Component.

    return (
        <html lang="en">
            <body className={`min-h-screen relative bg-fixed font-mono repple-default ${spaceMono.className}`}>

                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <UnsavedChangesProvider>

                            <BlobBackground /> {/* This renders all our background divs */}

                            {/* The main content is wrapped in a relative div to appear above the background */}
                            <div className="relative z-10">
                                <Navbar />
                                {children}
                            </div>

                            <Toaster position="top-center" reverseOrder={false} />

                        </UnsavedChangesProvider>
                    </AuthProvider>
                </QueryClientProvider>
            </body>
        </html>
    );
}
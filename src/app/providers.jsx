'use client';

import { AuthProvider } from "@/contexts/authContext";
import { UnsavedChangesProvider } from "@/contexts/unsavedChangesContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Navbar from "@/components/Navbar/Navbar";
import BlobBackground from "@/components/BlobBackground/BlobBackground";
import { useState } from "react"; // <-- Import useState

export default function Providers({ children }) {
    // THE FIX:
    // We create the queryClient instance inside the component using useState.
    // The function `() => new QueryClient(...)` ensures that the client is only created ONCE,
    // on the very first render, and not on subsequent re-renders.
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                staleTime: 1000 * 60 * 5, // 5 minutes
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <UnsavedChangesProvider>

                    <BlobBackground />

                    <div className="relative z-10">
                        <Navbar />
                        {children}
                    </div>

                    <Toaster position="top-center" reverseOrder={false} />

                </UnsavedChangesProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
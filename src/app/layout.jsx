"use client";

import "./globals.css";
import { AuthProvider } from "@/contexts/authContext"; // Import AuthProvider
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import Header from "@/components/Header/Header";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <BrowserRouter>
                        <Header />
                        {children}
                    </BrowserRouter>
                </AuthProvider>
            </body>
        </html>
    );
}

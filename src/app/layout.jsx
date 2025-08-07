import "./globals.css";
import { Space_Mono } from 'next/font/google';
import Providers from "./providers";

const spaceMono = Space_Mono({
    subsets: ["latin"],
    weight: ["400", "700"],
});

export const metadata = {
    title: 'Repple',
    description: 'A modern workout builder and tracker.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`min-h-screen relative bg-fixed font-mono repple-default ${spaceMono.className}`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
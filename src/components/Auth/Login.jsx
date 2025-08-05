'use client';

import { useState, useEffect } from "react";
import { doSignInWithEmailAndPassword, handleGoogleAuth } from "@/firebase/auth";
import { useAuth } from "@/contexts/authContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Login = () => {
    const router = useRouter();
    const { userLoggedIn, userLoading, setMergingFlag } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState(null);

    // This effect handles redirecting users who are already logged in.
    useEffect(() => {
        // Only check for redirects once the initial auth state is resolved.
        if (!userLoading && userLoggedIn) {
            router.push("/dashboard");
        }
    }, [userLoggedIn, userLoading, router]);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (isSigningIn) return;

        setError(null);
        setIsSigningIn(true);
        try {
            await doSignInWithEmailAndPassword(email, password);
            // On success, the AuthProvider's listener will update the state
            // and the useEffect above will handle the redirect.
        } catch (err) {
            setError(err.message);
            setIsSigningIn(false); // Only reset loading state on error
        }
    };

    const onGoogleAuthClick = async (e) => {
        e.preventDefault();
        if (isSigningIn) return;

        setError(null);
        setIsSigningIn(true);
        setMergingFlag(true); // Signal to AuthProvider that a merge might happen
        try {
            await handleGoogleAuth();
        } catch (err) {
            setError(err.message);
            setIsSigningIn(false);
        } finally {
            setMergingFlag(false); // Always reset the flag
        }
    };

    // Show a unified loading/redirecting state
    if (userLoading || userLoggedIn) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-500 font-bold text-lg animate-pulse">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen pt-15 md:p-0">
            <div className="bg-white/30 border-4 border-b-0 border-white/30 p-8 rounded-lg shadow-lg w-[90%] max-w-md my-5">
                <h1 className="text-xl md:text-3xl font-semibold text-center text-gray-700 mb-2 md:mb-6">Login</h1>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-600">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-1 md:py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-600">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-1 md:py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSigningIn}
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 text-sm md:text-base"
                    >
                        {isSigningIn ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <button
                    onClick={onGoogleAuthClick}
                    disabled={isSigningIn}
                    className="w-full py-2 mt-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 text-sm md:text-base"
                >
                    Sign In with Google
                </button>

                <div className="mt-4 text-center text-xs md:text-base text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-blue-600 hover:underline">
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
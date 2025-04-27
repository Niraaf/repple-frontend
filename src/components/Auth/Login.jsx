'use client';

import { useState } from "react";
import { doSignInWithEmailAndPassword, handleGoogleAuthSmart } from "@/firebase/auth";
import { useAuth } from "@/contexts/authContext";
import Link from "next/link";

const Login = () => {
    const { currentUser, userLoggedIn } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState(null);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setError(null);
            setIsSigningIn(true);
            await doSignInWithEmailAndPassword(email, password)
                .then(() => {
                    window.location.href = "/";
                })
                .catch((err) => {
                    setError(err.message);
                })
                .finally(() => {
                    setIsSigningIn(false);
                });
        }
    };

    const onGoogleAuthClick = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            await handleGoogleAuthSmart()
                //.then(() => window.location.href = "/")
                .catch((err) => setError(err.message))
                .finally(() => setIsSigningIn(false));
        }
    };    
    

    if (currentUser && !currentUser.isAnonymous && userLoggedIn) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h1 className="text-3xl font-semibold text-center text-gray-700 mb-6">
                        You are already logged in!
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-semibold text-center text-gray-700 mb-6">Login</h1>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSigningIn}
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        {isSigningIn ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <button
                    onClick={onGoogleAuthClick}
                    disabled={isSigningIn}
                    className="w-full py-2 mt-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300"
                >
                    {isSigningIn ? "Signing In with Google..." : "Sign In with Google"}
                </button>

                <div className="mt-4 text-center text-sm text-gray-600">
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

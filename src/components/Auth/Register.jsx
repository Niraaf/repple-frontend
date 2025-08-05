'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/authContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doCreateUserWithEmailAndPassword, handleGoogleAuth } from "@/firebase/auth";

const Register = () => {
    const { userLoggedIn, userLoading, setMergingFlag } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState(null);

    // Redirect if user is already logged in
    useEffect(() => {
        if (!userLoading && userLoggedIn) {
            router.push("/dashboard");
        }
    }, [userLoggedIn, userLoading, router]);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (isRegistering) return;

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setIsRegistering(true);
        setError(null);
        try {
            await doCreateUserWithEmailAndPassword(email, password);
        } catch (err) {
            setError(err.message);
            setIsRegistering(false);
        }
    };

    const onGoogleAuthClick = async (e) => {
        e.preventDefault();
        if (isRegistering) return;

        setIsRegistering(true);
        setError(null);
        setMergingFlag(true); // Signal to AuthProvider that a merge might happen
        try {
            await handleGoogleAuth();
        } catch (err) {
            setError(err.message);
            setIsRegistering(false);
        } finally {
            setMergingFlag(false); // Always reset the flag
        }
    };

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
                <h2 className="text-xl md:text-3xl font-semibold text-center text-gray-700 mb-2 md:mb-6">Register</h2>

                <form onSubmit={onSubmit} className="space-y-1 md:space-y-4">
                    {/* ... (Your form inputs are the same and correct) ... */}
                    {error && <div className="text-red-500 text-sm text-center pt-2">{error}</div>}
                    <button type="submit" disabled={isRegistering} className="w-full ...">
                        {isRegistering ? "Registering..." : "Register"}
                    </button>
                </form>

                <div className="text-center my-1 md:my-2 text-gray-500">or</div>

                <button onClick={onGoogleAuthClick} disabled={isRegistering} className="w-full ...">
                    Sign up with Google
                </button>

                <div className="text-center text-gray-600 text-xs md:text-base mt-4">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
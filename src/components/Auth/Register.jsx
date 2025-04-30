'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doCreateUserWithEmailAndPassword, handleGoogleAuthSmart } from "@/firebase/auth";

const Register = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState(null);

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!isRegistering) {
            if (password !== confirmPassword) {
                setError("Passwords do not match!");
                return;
            }

            setIsRegistering(true);
            setError(null);

            try {
                await doCreateUserWithEmailAndPassword(email, password);
                router.push("/");
            } catch (err) {
                setError(err.message);
            } finally {
                setIsRegistering(false);
            }
        }
    };

    const onGoogleAuthClick = async (e) => {
        e.preventDefault();
        if (!isRegistering) {
            setIsRegistering(true);
            setError(null);

            try {
                await handleGoogleAuthSmart();
                router.push("/");
            } catch (err) {
                setError(err.message);
            } finally {
                setIsRegistering(false);
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen pt-15 md:p-0">
            <div className="bg-white/30 border-4 border-b-0 border-white/30 p-8 rounded-lg shadow-lg w-[90%] max-w-md my-5">
                <h2 className="text-xl md:text-3xl font-semibold text-center text-gray-700 mb-2 md:mb-6">Register</h2>
                <form onSubmit={onSubmit} className="space-y-1 md:space-y-4">
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-600" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-1 md:py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-600" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-1 md:py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-600" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-1 md:py-2 my-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

                    <button
                        type="submit"
                        disabled={isRegistering}
                        className="w-full py-2 px-4 mb-2 md:mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 text-sm md:text-base"
                    >
                        {isRegistering ? "Registering..." : "Register"}
                    </button>
                </form>

                <div className="text-center my-1 md:my-2 text-gray-500">or</div>

                <button
                    onClick={onGoogleAuthClick}
                    disabled={isRegistering}
                    className="w-full py-2 px-4 mb-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 text-sm md:text-base"
                >
                    {isRegistering ? "Signing in with Google..." : "Sign in with Google"}
                </button>

                <div className="text-center text-gray-600 text-xs md:text-base">
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

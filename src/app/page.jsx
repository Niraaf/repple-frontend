"use client";

import { useAuth } from "@/contexts/authContext";
import { useEffect, useRef } from "react";
import { doSignInAnonymously } from "@/firebase/auth";

export default function Home() {
    const { currentUser } = useAuth();
    const hasAutoSignedIn = useRef(false);

    useEffect(() => {
        const autoSignIn = async () => {
            if (hasAutoSignedIn.current) {
                return;
            }
            hasAutoSignedIn.current = true;

            console.log("Attempting to sign in anonymously...");
            try {
                await doSignInAnonymously();
                console.log("Successfully signed in anonymously.");
            } catch (error) {
                console.error("Failed to auto sign in anonymously:", error);
            }
        };

        autoSignIn();
    }, []);

    return (
        <div>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-2xl font-bold">Hello there!</h1>
                {currentUser ?
                    <p className="mt-4 text-lg">UID: {currentUser.uid}</p>
                    :
                    <p className="mt-4 text-lg">Signing in anonymously...</p>
                }
            </div>


        </div>
    );
}

{/*
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1>HELO THERE!</h1>
        <p>Username: {currentUser?.displayName}</p>
        <p>Email: {currentUser?.email}</p>
        <p>UID: {currentUser?.uid}</p>
        <p>Photo URL: {currentUser?.photoURL}</p>
        <p>Provider Data: {currentUser?.providerData?.[0]?.providerId}</p>
        <p>Sign-in Time: {currentUser?.metadata?.creationTime}</p>
        <p>Last Sign-in Time: {currentUser?.metadata?.lastSignInTime}</p>
        <p>Is Anonymous: {currentUser?.isAnonymous ? "Yes" : "No"}</p>
        <p>Is Email Verified: {currentUser?.emailVerified ? "Yes" : "No"}</p>
    </div>
*/}
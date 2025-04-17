"use client";

import { useAuth } from "@/contexts/authContext"

export default function Home() {
    const { currentUser, userLoggedIn } = useAuth();

    return (
        <div>
            
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
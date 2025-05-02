"use client";

import { useAuth } from "@/contexts/authContext";
import { useEffect, useRef } from "react";
import { doSignInAnonymously } from "@/firebase/auth";

export default function Home() {
    const { currentUser } = useAuth();
    const hasAutoSignedIn = useRef(false);

    return (
        <div>
            <div className="flex flex-col items-center justify-center min-h-screen">
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
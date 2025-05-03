'use client';

import React, { useEffect, useContext, useState, useRef } from "react";
import { doSignInAnonymously } from "@/firebase/auth";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [userLoading, setUserLoading] = useState(true);

    const signInMutex = useRef(false);
    const hasTriedAutoSignIn = useRef(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser({ ...user });
                setUserLoggedIn(!user.isAnonymous);
                setUserLoading(false);
            } else {
                setCurrentUser(null);
                setUserLoggedIn(false);

                if (!hasTriedAutoSignIn.current && !signInMutex.current) {
                    hasTriedAutoSignIn.current = true;

                    console.log("User is null — attempting guest sign-in...");
                    try {
                        signInMutex.current = true;
                        await doSignInAnonymously();
                        console.log("Signed in anonymously");
                    } catch (err) {
                        console.error("Failed to sign in anonymously:", err);
                    } finally {
                        setUserLoading(false);
                        setUserLoggedIn(true);
                        signInMutex.current = false;
                    }
                }
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userLoggedIn,
        userLoading,
        signInMutex
    };

    return (
        <AuthContext.Provider value={value}>
            {!userLoading && children}
        </AuthContext.Provider>
    );
}
'use client';

import React, { useEffect, useContext, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { supabase } from "@/supabase/supabase";
import { doSignInAnonymously, doSignOut as firebaseSignOut } from "@/firebase/auth";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [userLoading, setUserLoading] = useState(true);

    const isIntentionalSignOut = useRef(false);
    const isMergingAccounts = useRef(false);

    useEffect(() => {
        const syncAndFetchProfile = async (user) => {
            try {
                const { data: profile, error } = await supabase
                    .from("users")
                    .upsert({ firebase_uid: user.uid, email: user.email }, { onConflict: 'firebase_uid' })
                    .select()
                    .single();

                if (error) throw error;
                setUserProfile(profile);
            } catch (error) {
                console.error("Error syncing user profile:", error);
                setUserProfile(null);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in.
                setCurrentUser(user);
                setUserLoggedIn(!user.isAnonymous);
                await syncAndFetchProfile(user);
                setUserLoading(false);
            } else {
                // User is signed out.
                setCurrentUser(null);
                setUserProfile(null);
                setUserLoggedIn(false);

                // Only sign in as a guest if this wasn't an intentional sign-out.
                if (isIntentionalSignOut.current || isMergingAccounts.current) {
                    // If the user signed out intentionally or is merging, just reset the flag.
                    if (isIntentionalSignOut.current) isIntentionalSignOut.current = false;
                } else {
                    // This is a true new visitor, so create a guest session.
                    await doSignInAnonymously();
                }
                setUserLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // We wrap the sign-out function to set our intent flag.
    const signOut = async () => {
        isIntentionalSignOut.current = true;
        await firebaseSignOut();
    };

    const setMergingFlag = (isMerging) => {
        isMergingAccounts.current = isMerging;
    };

    const value = {
        currentUser,
        userProfile,
        userLoggedIn,
        userLoading,
        signOut,
        setMergingFlag,
    };

    return (
        <AuthContext.Provider value={value}>
            {!userLoading && children}
        </AuthContext.Provider>
    );
}
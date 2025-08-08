'use client';

import React, { useEffect, useContext, useState } from "react";
import { createSupabaseBrowserClient } from "@/supabase/supabaseClient";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [userLoading, setUserLoading] = useState(true); // Start as true
    const [supabase] = useState(() => createSupabaseBrowserClient());

    useEffect(() => {
        const updateUserSession = async (sessionUser) => {
            setUser(sessionUser);
            setUserLoggedIn(!!sessionUser);

            if (sessionUser) {
                // If a user is logged in, fetch their corresponding profile.
                try {
                    const { data: profile, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', sessionUser.id)
                        .single();

                    if (error) throw error;
                    setUserProfile(profile);
                } catch (error) {
                    console.error("Could not fetch user profile:", error);
                    setUserProfile(null);
                }
            } else {
                // If no user, ensure profile is also null.
                setUserProfile(null);
            }
            // Only set loading to false after all user-related data is settled.
            setUserLoading(false);
        };

        // Get the initial session on page load.
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            await updateUserSession(session?.user ?? null);
        };

        getInitialSession();

        // Listen for future changes in the authentication state.
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                updateUserSession(session?.user ?? null);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const value = { user, userProfile, userLoggedIn, userLoading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
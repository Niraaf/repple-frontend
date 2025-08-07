'use client';
import { createSupabaseBrowserClient } from "./supabaseClient";
const supabase = createSupabaseBrowserClient();

export const doCreateUserWithEmailAndPassword = async (email, password) => {
    return await supabase.auth.signUp({ email, password });
};

export const doSignInWithEmailAndPassword = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
};

export const handleGoogleAuth = async () => {
    return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
        }
    });
};

export const doSignOut = async () => {
    return await supabase.auth.signOut();
};

export const doPasswordReset = async (email) => {
    return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
    });
};

export const doPasswordChange = async (newPassword) => {
    return await supabase.auth.updateUser({ password: newPassword });
};

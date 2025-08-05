// src/firebase/auth.js
import { auth } from "./firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithCredential,
    GoogleAuthProvider,
    signInAnonymously,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    sendEmailVerification,
    EmailAuthProvider,
    linkWithCredential,
    linkWithPopup,
    deleteUser as deleteFirebaseUser
} from "firebase/auth";
import { supabase } from "../supabase/supabase";

// This file contains pure functions for interacting with Firebase Auth.
// It can also interact with other services (like Supabase for deletion) when necessary.


/**
 * Creates a new user with email/password or links it to an existing guest account.
 */
export const doCreateUserWithEmailAndPassword = async (email, password) => {
    const user = auth.currentUser;
    if (user && user.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);
        return linkWithCredential(user, credential);
    }
    return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Signs in a user with email and password.
 */
export const doSignInWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Handles Google authentication, including linking to guest accounts
 * and resolving account collision errors.
 */
export const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    const currentUser = auth.currentUser;
    const isGuestUser = currentUser && currentUser.isAnonymous;

    if (isGuestUser) {
        try {
            return await linkWithPopup(currentUser, provider);
        } catch (error) {
            // Handle the case where the Google account is already in use
            if (error.code === 'auth/credential-already-in-use') {
                console.warn("Google account already in use. Merging accounts...");
                const credential = GoogleAuthProvider.credentialFromError(error);
                if (!credential) throw new Error("Failed to extract Google credential from merge conflict error.");

                // Important: Delete the temporary guest user first
                await handleDeleteUser(currentUser);

                // Then sign in with the existing Google account
                return signInWithCredential(auth, credential);
            }
            throw error; // Re-throw other errors
        }
    }
    // Standard sign-in with Google if there's no guest user.
    return signInWithPopup(auth, provider);
};

/**
 * Signs in a user anonymously, reusing a recent guest session if available from localStorage.
 */
export const doSignInAnonymously = async () => {
    // If a non-guest user is already signed in, do nothing.
    if (auth.currentUser && !auth.currentUser.isAnonymous) {
        return auth.currentUser;
    }

    const storedUid = localStorage.getItem("repple-guest_uid");
    const storedCreationTime = localStorage.getItem("repple-guest_creation_time");
    const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    if (!storedUid || !storedCreationTime) {
        return createNewAnonymousUser();
    }

    const accountAge = Date.now() - parseInt(storedCreationTime, 10);
    if (accountAge > EXPIRATION_MS) {
        console.warn("Stored guest account expired. Creating a new one.");
        if (auth.currentUser) await handleDeleteUser(auth.currentUser);
        return createNewAnonymousUser();
    }

    // If a user is already in the auth state and their UID matches, reuse them.
    if (auth.currentUser?.uid === storedUid) {
        return auth.currentUser;
    }

    // Fallback to creating a new user if something is out of sync
    return createNewAnonymousUser();
};

/**
 * Helper to create a new anonymous user and store their session info in localStorage.
 */
const createNewAnonymousUser = async () => {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    localStorage.setItem("repple-guest_uid", user.uid);
    localStorage.setItem("repple-guest_creation_time", Date.now().toString());
    console.log("New anonymous user created:", user.uid);
    return user;
};

/**
 * Deletes a user from both Supabase and Firebase.
 * Also clears any guest session data from localStorage.
 * @param {object} user - The Firebase user object to delete.
 */
const handleDeleteUser = async (user) => {
    if (!user) return;
    const uidToDelete = user.uid; // Store UID in case 'user' object becomes invalid

    try {
        // First, delete the profile from your own database.
        const { error: dbError } = await supabase.from("users").delete().eq("firebase_uid", uidToDelete);
        if (dbError) console.error("Error deleting user from Supabase:", dbError);
        else console.log("User deleted from Supabase:", uidToDelete);

        // Then, delete the user from Firebase Auth.
        await deleteFirebaseUser(user);
        console.log("Firebase user deleted:", uidToDelete);
    } catch (authError) {
        console.error("Error deleting user from Firebase Auth:", authError);
    } finally {
        // Always clear guest storage after a deletion attempt.
        clearGuestStorage();
    }
};

const clearGuestStorage = () => {
    localStorage.removeItem("repple-guest_uid");
    localStorage.removeItem("repple-guest_creation_time");
};

/**
 * Signs out the current user.
 */
export const doSignOut = () => {
    return signOut(auth);
};

/**
 * Sends a password reset email to the given address.
 */
export const doPasswordReset = (email) => {
    return sendPasswordResetEmail(auth, email);
};

/**
 * Changes the current user's password.
 */
export const doPasswordChange = (password) => {
    if (!auth.currentUser) {
        throw new Error("No user is currently signed in.");
    }
    return updatePassword(auth.currentUser, password);
};

/**
 * Sends an email verification link to the current user.
 */
export const doSendEmailVerification = () => {
    if (!auth.currentUser) {
        throw new Error("No user is currently signed in.");
    }
    return sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/dashboard`, // A good redirect target after verification
    });
};
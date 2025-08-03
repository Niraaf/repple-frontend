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
    deleteUser,
    onAuthStateChanged,
} from "firebase/auth";
import { supabase } from "../supabase/supabase";

/**
 * Saves or updates a user profile in the Supabase 'users' table.
 * This is the critical link between Firebase Auth and the application database.
 * @param {object} user - The Firebase user object.
 */
const saveUserToSupabase = async (user) => {
    try {
        // Use Supabase's 'upsert' to either insert a new user or update an existing one.
        // It checks for a conflict on the 'firebase_uid' column.
        const { error } = await supabase
            .from("users")
            .upsert(
                { firebase_uid: user.uid, email: user.email },
                { onConflict: 'firebase_uid' }
            );

        if (error) throw error;

        console.log("User profile synced with Supabase for UID:", user.uid);
    } catch (error) {
        console.error("Error during saveUserToSupabase:", error);
        // Re-throw the error to be handled by the calling function if necessary
        throw error;
    }
};

/**
 * Main listener for authentication state changes.
 * This function is the central point for syncing user state with the database.
 */
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Auth state changed. User is signed in:", user.uid);
        try {
            await saveUserToSupabase(user);
        } catch (error) {
            console.error("onAuthStateChanged: Failed to sync user to Supabase:", error);
        }
    } else {
        console.log("Auth state changed. User is signed out.");
    }
});

/**
 * Creates a new user with email/password or links it to an existing guest account.
 */
export const doCreateUserWithEmailAndPassword = async (email, password) => {
    const user = auth.currentUser;

    // If the current user is a guest, link the new email/password to that account.
    if (user && user.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);
        const userCredential = await linkWithCredential(user, credential);
        console.log("Guest account successfully linked to email.", userCredential.user.uid);
        return userCredential.user;
    }

    // Otherwise, create a brand new user account.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("New user created with email.", userCredential.user.uid);
    return userCredential.user;
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
            // Attempt to link the current guest account with the Google account via a popup.
            const userCredential = await linkWithPopup(currentUser, provider);
            console.log("Guest account successfully linked to Google.", userCredential.user.uid);
            return userCredential.user;
        } catch (error) {
            // This specific error is common and needs special handling.
            // It means the Google account is already linked to another (non-guest) user.
            // The desired behavior is to discard the guest account and sign into the existing Google account.
            if (error.code === 'auth/credential-already-in-use') {
                console.warn("Google account is already in use. Merging accounts...");

                // Get the credential for the existing Google account from the error.
                const credential = GoogleAuthProvider.credentialFromError(error);
                if (!credential) {
                    throw new Error("Failed to extract Google credential from merge conflict error.");
                }

                // Delete the temporary guest user from Firebase and Supabase.
                await handleDeleteUser(currentUser);

                // Sign in with the pre-existing Google account credential.
                const existingUserCredential = await signInWithCredential(auth, credential);
                console.log("Successfully signed into existing Google account.", existingUserCredential.user.uid);
                return existingUserCredential.user;
            }
            // Re-throw any other unexpected errors.
            throw error;
        }
    } else {
        // Standard sign-in with Google if there's no guest user.
        return await signInWithPopup(auth, provider);
    }
};

/**
 * Signs in a user anonymously, reusing a recent guest session if available.
 */
export const doSignInAnonymously = async () => {
    // If a non-guest user is already signed in, do nothing.
    if (auth.currentUser && !auth.currentUser.isAnonymous) {
        console.log("Returning existing signed-in user:", auth.currentUser.uid);
        return auth.currentUser;
    }

    const storedUid = localStorage.getItem("repple-guest_uid");
    const storedCreationTime = localStorage.getItem("repple-guest_creation_time");
    const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    if (storedUid && storedCreationTime) {
        const accountAge = Date.now() - parseInt(storedCreationTime, 10);

        // If the stored guest session has expired, delete the old user and create a new one.
        if (accountAge > EXPIRATION_MS) {
            console.warn("Stored guest account expired. Creating a new one.");
            // We pass the user object if it exists to delete it.
            if (auth.currentUser) await handleDeleteUser(auth.currentUser);
            return createNewAnonymousUser();
        }
        
        // If a user is already in the auth state and their UID matches, reuse them.
        if (auth.currentUser && auth.currentUser.uid === storedUid) {
            console.log("Reusing active anonymous session:", auth.currentUser.uid);
            return auth.currentUser;
        }
    }

    // If no valid stored session, create a new one.
    return createNewAnonymousUser();
};

/**
 * Creates a new anonymous user and stores their session info in localStorage.
 */
const createNewAnonymousUser = async () => {
    const userCredential = await signInAnonymously(auth);
    localStorage.setItem("repple-guest_uid", userCredential.user.uid);
    localStorage.setItem("repple-guest_creation_time", Date.now().toString());
    console.log("New anonymous user created:", userCredential.user.uid);
    return userCredential.user;
};

/**
 * Deletes a user from both Supabase and Firebase.
 * Also clears any guest session data from localStorage.
 * @param {object} user - The Firebase user object to delete.
 */
const handleDeleteUser = async (user) => {
    if (!user) return;

    try {
        // First, delete the profile from the database.
        const { error: dbError } = await supabase.from("users").delete().eq("firebase_uid", user.uid);
        if (dbError) console.error("Error deleting user from Supabase:", dbError);
        else console.log("User deleted from Supabase:", user.uid);

        // Then, delete the user from Firebase Auth.
        await deleteUser(user);
        console.log("Firebase user deleted:", user.uid);
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
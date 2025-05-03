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
    getRedirectResult,
    linkWithRedirect,
    signInWithRedirect,
} from "firebase/auth";
import { supabase } from "../supabase/supabase";

const saveUserToSupabase = async (user) => {
    try {
        const { data, error } = await supabase
            .from("profile")
            .select()
            .eq("firebase_uid", user.uid)
            .single();

        if (error && error.code !== 'PGRST116') {
            // An actual error occurred that's NOT "No rows found"
            console.error("Supabase select error:", error);
            throw error;
        }

        if (data) {
            // User exists, update
            const { error: updateError } = await supabase
                .from("profile")
                .update({ firebase_uid: user.uid, email: user.email })
                .eq("firebase_uid", user.uid);

            if (updateError) {
                console.error("Error updating user:", updateError);
                throw updateError;
            }
            console.log("User updated in Supabase");
        } else {
            // No user found, insert new
            const { error: insertError } = await supabase
                .from("profile")
                .insert({ firebase_uid: user.uid, email: user.email });

            if (insertError) {
                console.error("Error inserting user:", insertError);
                throw insertError;
            }
            console.log("New user saved to Supabase");
        }
    } catch (error) {
        console.error("Error during saveUserToSupabase:", error);
        throw error;
    }
};

const trySaveUserToSupabase = async () => {
    const user = auth.currentUser;
    if (user && user.uid) {
        try {
            await saveUserToSupabase(user);
        } catch (error) {
            console.error("Failed to save user to Supabase:", error);
        }
    }
};


// on auth state changed listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("auth state changed");
        await trySaveUserToSupabase();
    } else {
        // User is signed out
        // ...
    }
});


export const doCreateUserWithEmailAndPassword = async (email, password) => {
    try {
        const user = auth.currentUser;
        if (user && user.isAnonymous) {
            const userCredential = await linkWithCredential(
                user,
                EmailAuthProvider.credential(email, password)
            );
            console.log("User linked:", userCredential.user);
            return userCredential.user;
        } else {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            console.log("User created:", userCredential.user);
            return userCredential.user;
        }
    } catch (error) {
        console.error("Error during email/password registration:", error);
        throw error;
    }
};

export const doSignInWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
        console.log("User signed in:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
};

export const handleGoogleAuth = async () => {
    const user = auth.currentUser;
    const provider = new GoogleAuthProvider();

    if (user && user.isAnonymous) {

        try {
            // Try linking guest to Google account

            const userCredential = await linkWithPopup(user, provider);
            console.log("Guest linked with Google:", userCredential.user);
            return userCredential.user;

        } catch (error) {
            if (error.code === 'auth/credential-already-in-use') {
                console.warn("Google account already linked. Using existing credential...");

                const credential = GoogleAuthProvider.credentialFromError(error);

                if (!credential) {
                    console.error("Failed to extract credential from error.");
                    throw error;
                }

                await handleDeleteUser(user);

                const existingUserCredential = await signInWithCredential(auth, credential);
                console.log("Signed into existing Google account:", existingUserCredential.user);

                return existingUserCredential.user;
            } else {
                console.error("Unexpected error during linking:", error);
                throw error;
            }
        }
    } else {
        // Not a guest — regular sign in with popup
        try {
            const userCredential = await signInWithPopup(auth, provider);
            console.log("User signed in with Google:", userCredential.user);
            return userCredential.user;
        } catch (error) {
            console.error("Error with Google sign-in:", error);
            throw error;
        }
    }
};

export const doSignInAnonymously = async () => {
    if (auth?.currentUser && !auth.currentUser.isAnonymous) {
        console.log("User is already signed in:", auth.currentUser);
        return auth.currentUser;
    }

    const EXPIRATION_MS = 1440 * 60 * 1000;  // 1 day
    const storedUid = localStorage.getItem("repple-guest_uid");
    const storedCreationTime = localStorage.getItem("repple-guest_creation_time");

    try {
        if (storedUid && storedCreationTime) {
            const accountAge = Date.now() - parseInt(storedCreationTime);
            const user = auth.currentUser;

            if (accountAge > EXPIRATION_MS) {
                console.warn("Guest account expired.");
                await handleDeleteUser(user);
                return await createNewAnonymousUser();
            }

            if (user && user.uid === storedUid) {
                console.log("Reusing stored anonymous user:", user);
                return user;
            }

            console.warn("UID mismatch. Clearing localStorage.");
            clearGuestStorage();
            return await createNewAnonymousUser();
        }

        // No stored guest account
        return await createNewAnonymousUser();

    } catch (error) {
        console.error("Error during anonymous sign-in:", error);
        throw error;
    }
};

const handleDeleteUser = async (user) => {
    console.log("deleting user", user.uid);
    if (!user) {
        console.warn("No user provided for deletion.");
        return;
    }

    try {
        const { error: deleteError } = await supabase
            .from("profile")
            .delete()
            .eq("firebase_uid", user.uid);

        if (deleteError) {
            console.error("Error deleting user from Supabase:", deleteError);
        } else {
            console.log("User deleted from Supabase");
        }

        await deleteUser(user);
        console.log("Firebase user deleted.");
    } catch (err) {
        console.error("Error deleting Firebase user:", err);
    }

    clearGuestStorage();
};


const createNewAnonymousUser = async () => {
    const userCredential = await signInAnonymously(auth);
    localStorage.setItem("repple-guest_uid", userCredential.user.uid);
    localStorage.setItem("repple-guest_creation_time", Date.now().toString());
    console.log("New anonymous user signed in:", userCredential.user);
    return userCredential.user;
};

const clearGuestStorage = () => {
    localStorage.removeItem("repple-guest_uid");
    localStorage.removeItem("repple-guest_creation_time");
};

export const doSignOut = async () => {
    try {
        await signOut(auth);
        console.log("User signed out.");
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

export const doPasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log("Password reset email sent!");
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
    }
};

export const doPasswordChange = async (password) => {
    try {
        const user = auth.currentUser;
        await updatePassword(user, password);
        console.log("Password updated successfully!");
    } catch (error) {
        console.error("Error updating password:", error);
        throw error;
    }
};

export const doSendEmailVerification = async () => {
    try {
        await sendEmailVerification(auth.currentUser, {
            url: `${window.location.origin}`,
            handleCodeInApp: true,
        });
        console.log("Email verification sent!");
    } catch (error) {
        console.error("Error sending email verification:", error);
        throw error;
    }
};

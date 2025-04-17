import { auth } from "./firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signInAnonymously,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    sendEmailVerification,
    EmailAuthProvider
} from "firebase/auth";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
    try {
        const user = auth.currentUser;
        if (user && user.isAnonymous) {
            const userCredential = await user.linkWithCredential(
                EmailAuthProvider.credential(email, password)
            );
            console.log("User linked:", userCredential.user);
            return userCredential.user;
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
};

export const doSignInWithGoogle = async () => {
    try {
        const user = auth.currentUser;
        const provider = new GoogleAuthProvider();

        let userCredential;
        if (user && user.isAnonymous) {
            userCredential = await user.linkWithPopup(provider);
            console.log("User linked with Google:", userCredential.user);
        } else {
            userCredential = await signInWithPopup(auth, provider);
            console.log("User signed in with Google:", userCredential.user);
        }

        // TODO: Save user to database here, if needed
        return userCredential.user;
    } catch (error) {
        console.error("Error with Google sign-in:", error);
        throw error;
    }
};

export const doSignInAnonymously = async () => {
    try {
        const userCredential = await signInAnonymously(auth);
        console.log("User signed in anonymously:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in anonymously:", error);
        throw error;
    }
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

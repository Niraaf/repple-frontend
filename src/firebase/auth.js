import { auth } from "./firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    sendEmailVerification,
} from "firebase/auth";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log("User created:", user);
            return user;
        })
        .catch((error) => {
            console.error("Error creating user:", error);
        });
};

export const doSignInWithEmailAndPassword = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log("User signed in:", user);
            return user;
        })
        .catch((error) => {
            console.error("Error signing in:", error);
        });
};

export const doSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log("User signed in with Google:", user);
            return user;
        })
        .catch((error) => {
            console.error("Error signing in with Google:", error);
        });
    // TODO: Save user to database here, if needed
    return result;
};

export const doSignOut = async () => {
    return await signOut(auth);
};

export const doPasswordReset = async (email) => {
    return sendPasswordResetEmail(auth, email)
        .then(() => {
            console.log("Password reset email sent!");
        })
        .catch((error) => {
            console.error("Error sending password reset email:", error);
        });
}

export const doPasswordChange = async (password) => {
    const user = auth.currentUser;
    return await updatePassword(user, password)
        .then(() => {
            console.log("Password updated successfully!");
        })
        .catch((error) => {
            console.error("Error updating password:", error);
        });
}

export const doSendEmailVerification = async () => {
    return sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}`,
        handleCodeInApp: true,
    })
        .then(() => {
            console.log("Email verification sent!");
        })
        .catch((error) => {
            console.error("Error sending email verification:", error);
        });
}
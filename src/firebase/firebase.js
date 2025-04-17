// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCyULj04FmBInFJhJ-xVucrBfhj63jKrW8",
  authDomain: "repple-dd229.firebaseapp.com",
  projectId: "repple-dd229",
  storageBucket: "repple-dd229.firebasestorage.app",
  messagingSenderId: "677625973911",
  appId: "1:677625973911:web:1139f3a454c4339a906dd2",
  measurementId: "G-D03YEHPZRB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Only initialize analytics on the client-side
let analytics = null;
if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

export { app, analytics, auth };

/**
 * firebase.js — Firebase configuration and initialization
 * ========================================================
 */
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAjA5PVjI6hk2y4sK03AFn0abcJgipMOIk",
  authDomain: "duplidetector.firebaseapp.com",
  projectId: "duplidetector",
  storageBucket: "duplidetector.firebasestorage.app",
  messagingSenderId: "719177626909",
  appId: "1:719177626909:web:6f27050f68998c75095df4",
  measurementId: "G-FDX90RRMKR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API,
  authDomain: "for-jmwebgo.firebaseapp.com",
  databaseURL: "https://for-jmwebgo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "for-jmwebgo",
  storageBucket: "for-jmwebgo.appspot.com",
  messagingSenderId: "788688140898",
  appId: "1:788688140898:web:6ee37da89c69ea1e0eaf3b",
  measurementId: "G-1DVDKB9M0Q",
};

// Prevent initializing Firebase multiple times (important in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export { app };

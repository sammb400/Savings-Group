import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add these variables to your .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics and export it, checking for browser support.
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

// To enable offline persistence for Firestore
// This is great for performance and offline capabilities.
// import { enableIndexedDbPersistence } from "firebase/firestore";
// enableIndexedDbPersistence(db)
//   .catch((err) => {
//     if (err.code == 'failed-precondition') {
//       // Multiple tabs open, persistence can only be enabled in one tab at a time.
//     } else if (err.code == 'unimplemented') {
//       // The current browser does not support all of the features required to enable persistence
//     }
//   });
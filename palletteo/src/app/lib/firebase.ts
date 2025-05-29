import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDUgfELeUmSSDMP9u7QosB3KvyHvrp6z6c",
  authDomain: "palletteo.firebaseapp.com",
  projectId: "palletteo",
  storageBucket: "palletteo.firebasestorage.app",
  messagingSenderId: "576422341529",
  appId: "1:576422341529:web:744806ce127fcce86f0108",
  measurementId: "G-48LCE78F8V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only on client side
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;

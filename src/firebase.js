import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';


//Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHdW7_L4O8lSZDCdw460HqfrEQQ3yS4rk",
  authDomain: "my-pawfect-match.firebaseapp.com",
  projectId: "my-pawfect-match",
  storageBucket: "my-pawfect-match.firebasestorage.app",
  messagingSenderId: "980822390022",
  appId: "1:980822390022:web:df0121b98b1637d3871a87",
};

// Initialization of Firebase and Auth
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
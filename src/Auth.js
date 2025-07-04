import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAHdW7_L4O8lSZDCdw460HqfrEQQ3yS4rk",
  authDomain: "my-pawfect-match.firebaseapp.com",
  projectId: "my-pawfect-match",
  storageBucket: "my-pawfect-match.appspot.com",
  messagingSenderId: "980822390022",
  appId: "1:980822390022:web:df0121b98b1637d3871a87",
  measurementId: "G-RHQ1Y3NZ3F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };

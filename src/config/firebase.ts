import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCqfGMwb6pNMY7pmVkPnZ5Fbjl8MsYMvjc",
  authDomain: "cipher-music.firebaseapp.com",
  projectId: "cipher-music",
  storageBucket: "cipher-music.firebasestorage.app",
  messagingSenderId: "280269501511",
  appId: "1:280269501511:web:46fa6a823572a034162d62",
  measurementId: "G-DS2TPW077V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

export default app;
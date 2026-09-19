import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyA0rOejO9Dvl4P4xGoGPzSx8uElbYwaNXs",
  authDomain: "signframe-7c704.firebaseapp.com",
  projectId: "signframe-7c704",
  storageBucket: "signframe-7c704.firebasestorage.app",
  messagingSenderId: "149198075143",
  appId: "1:149198075143:web:dae9b7974dbf09c4bfc1a2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
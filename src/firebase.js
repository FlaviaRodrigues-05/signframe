import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider
} from 'firebase/auth'
import {
  getFirestore
} from 'firebase/firestore'


const firebaseConfig = {
  apiKey: "AIzaSyA0rOejO9Dvl4P4xGoGPzSx8uElbYwaNXs",
  authDomain: "signframe-7c704.firebaseapp.com",
  projectId: "signframe-7c704",
  storageBucket: "signframe-7c704.firebasestorage.app",
  messagingSenderId: "149198075143",
  appId: "1:149198075143:web:dae9b7974dbf09c4bfc1a2"
}


const app = initializeApp(firebaseConfig)


// Authentication
export const auth = getAuth(app)


// Google login
export const googleProvider =
  new GoogleAuthProvider()


// Firestore
export const db =
  getFirestore(app)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "yuviiiiiiappppp",
  appId: "1:21027807915:web:3f0b44b0b8b74e908acdee",
  storageBucket: "yuviiiiiiappppp.firebasestorage.app",
  apiKey: "AIzaSyCI7ikm_Ysf3m5jL8Wo3Wx_pSzK-35APNw",
  authDomain: "yuviiiiiiappppp.firebaseapp.com",
  messagingSenderId: "21027807915",
  measurementId: "G-8TZY8118BF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "dream-home-c0ea7.firebaseapp.com",
  projectId: "dream-home-c0ea7",
  storageBucket: "dream-home-c0ea7.appspot.com",
  messagingSenderId: "815595267174",
  appId: "1:815595267174:web:58d1cbe11142884b39b9a7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig); 
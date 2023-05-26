// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import firebase from 'firebase/app';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpAKFUM18Bu4NgIoiuTlX8VKTy8g9yPGA",
  authDomain: "midjourney-api-demo.firebaseapp.com",
  projectId: "midjourney-api-demo",
  storageBucket: "midjourney-api-demo.appspot.com",
  messagingSenderId: "206805988776",
  appId: "1:206805988776:web:8c8a807190b29559e5d99d",
  measurementId: "G-KR9STCMSSJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);

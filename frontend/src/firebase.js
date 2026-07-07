import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2a8iF9Mg_6rXKd6dnACfF87haiidd7Uk",
  authDomain: "dyno-35bff.firebaseapp.com",
  projectId: "dyno-35bff",
  storageBucket: "dyno-35bff.firebasestorage.app",
  messagingSenderId: "217961060313",
  appId: "1:217961060313:web:eb4fbea963238b40b3abc8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
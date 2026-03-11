import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAW5eV6Rqn42Z4sxqezigtRLGzmZZxK5SE",
  authDomain: "goretail-b0fa9.firebaseapp.com",
  projectId: "goretail-b0fa9",
  storageBucket: "goretail-b0fa9.firebasestorage.app",
  messagingSenderId: "906722740256",
  appId: "1:906722740256:web:8152556d9f72c2aae21445",
  measurementId: "G-5TKNCLTHST"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
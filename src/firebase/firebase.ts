import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDKdcIsFGRHK0M03gJpt1q8_GDug_dNc7U",
    authDomain: "advice-tech.firebaseapp.com",
    projectId: "advice-tech",
    storageBucket: "advice-tech.firebasestorage.app",
    messagingSenderId: "616337459659",
    appId: "1:616337459659:web:66efc509eb2cce76c38e4e",
    measurementId: "G-QB1ME2MWCF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
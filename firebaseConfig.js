import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBJFXBI5pbg8Sn96SQLPndXKhQpVzeE2-Y",
    authDomain: "librarymanagementsystem-f74b8.firebaseapp.com",
    projectId: "librarymanagementsystem-f74b8",
    storageBucket: "librarymanagementsystem-f74b8.appspot.com",
    messagingSenderId: "580467516582",
    appId: "1:580467516582:web:7f2d36820502cffd934067",
    measurementId: "G-W420NWFWNC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyCOxB6A3prodXNET17osSPJmBNFi-Dlu3g",
  authDomain: "myproject-9f683.firebaseapp.com",
  projectId: "myproject-9f683",
  storageBucket: "myproject-9f683.firebasestorage.app",
  messagingSenderId: "258234497106",
  appId: "1:258234497106:web:c8f5ebd4c4c3517b2f478b",
  measurementId: "G-5Z7QDQ46DV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
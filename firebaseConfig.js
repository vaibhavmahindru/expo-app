// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuGhvnZKuKaZSEr3qvkSz_WhheXCrZBCk",
  authDomain: "device-tracking-baad2.firebaseapp.com",
  databaseURL: "https://device-tracking-baad2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "device-tracking-baad2",
  storageBucket: "device-tracking-baad2.firebasestorage.app",
  messagingSenderId: "1077475514128",
  appId: "1:1077475514128:web:bfdf120da1075d6427b795"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
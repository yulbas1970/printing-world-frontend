import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCFabrizPkM4ToegIQiKOJxn7vOv9UEFzQ",
  authDomain: "imprimiendo-el-mundo-web.firebaseapp.com",
  projectId: "imprimiendo-el-mundo-web",
  storageBucket: "imprimiendo-el-mundo-web.firebasestorage.app",
  messagingSenderId: "907178559928",
  appId: "1:907178559928:web:e4f5fd9bff5993c15c274d"
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const db = getFirestore(app);

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBH7lR75T0uCdKAbT-qAfGB04vlYhJv_Y8",
  authDomain: "viton-403b8.firebaseapp.com",
  projectId: "viton-403b8",
  storageBucket: "viton-403b8.appspot.com",
  messagingSenderId: "260253227668",
  appId: "1:260253227668:web:cc5d5700fd04183b4bb281",
  measurementId: "G-ZQQH0TT650"
};

const firebaseApp = initializeApp(firebaseConfig);

export const storage = getStorage(firebaseApp);
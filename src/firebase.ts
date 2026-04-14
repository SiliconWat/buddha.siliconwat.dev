import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDCSzWQF6lX7tTsiQcYxpZZpfB8m2lU_1I",
    authDomain: "siliconwat-98373.firebaseapp.com",
    projectId: "siliconwat-98373",
    storageBucket: "siliconwat-98373.firebasestorage.app",
    messagingSenderId: "1091231177300",
    appId: "1:1091231177300:web:5b9a73735225b00ecfabc1",
    measurementId: "G-1LZ5Z3X993"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const messaging = isSupported().then((yes) =>
    yes ? getMessaging(app) : null
);

if (location.hostname === "localhost") {
    connectAuthEmulator(auth, "http://localhost:9093", {
        disableWarnings: true
    });
    //(auth.settings as any).appVerificationDisabledForTesting = true;
    connectFirestoreEmulator(db, "localhost", 8083);
    connectStorageEmulator(storage, "localhost", 9193);
    connectFunctionsEmulator(functions, "localhost", 5004);
}

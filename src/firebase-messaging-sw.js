importScripts(
    "https://www.gstatic.com/firebasejs/11.7.1/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/11.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "AIzaSyDCSzWQF6lX7tTsiQcYxpZZpfB8m2lU_1I",
    authDomain: "siliconwat-98373.firebaseapp.com",
    projectId: "siliconwat-98373",
    storageBucket: "siliconwat-98373.firebasestorage.app",
    messagingSenderId: "1091231177300",
    appId: "1:1091231177300:web:5b9a73735225b00ecfabc1",
    measurementId: "G-1LZ5Z3X993"
});

const messaging = firebase.messaging();

// Firebase Configuration
// IMPORTANT: This file should be replaced with environment-specific config in production
// For production, consider using environment variables or a build process

const firebaseConfig = {
    apiKey: "AIzaSyDKh2BEQwn9zPJ_hzCh_U2IQw8WZMO2Mls",
    authDomain: "electric-oracle-spiritual.firebaseapp.com",
    projectId: "electric-oracle-spiritual",
    storageBucket: "electric-oracle-spiritual.firebasestorage.app",
    messagingSenderId: "542817005556",
    appId: "1:542817005556:web:c93dc1b62f58ce8f53f976"
};

// Initialize Firebase (will be used by other scripts)
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
}

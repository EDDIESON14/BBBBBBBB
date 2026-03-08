// =============================================
// FIREBASE CONFIGURATION
// =============================================
// STEP 1: Go to https://console.firebase.google.com
// STEP 2: Create a project → Add Web App
// STEP 3: Copy your config and paste it below
// =============================================

const firebaseConfig = {
  apiKey:            "PASTE_YOUR_API_KEY_HERE",
  authDomain:        "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "PASTE_YOUR_PROJECT_ID",
  storageBucket:     "PASTE_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId:             "PASTE_YOUR_APP_ID"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('[Firebase] Connected to project:', firebaseConfig.projectId);
} catch(e) {
  console.warn('[Firebase] Init failed — running in offline mode:', e.message);
}

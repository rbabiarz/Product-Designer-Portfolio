/* firebase-config.js — config for the homepage reader poll (poll.js).
   Paste your Firebase web-app config below and the poll goes live with a global
   running total shared across every visitor. Until real values are in, poll.js
   runs a per-browser local preview (it detects the 'YOUR_' placeholder).

   ── 5-minute setup ─────────────────────────────────────────────────────────
   1. console.firebase.google.com  →  Add project  (the free "Spark" plan is plenty).
   2. Build → Firestore Database → Create database → Start in production mode.
   3. Project settings (⚙) → Your apps → Web (</>) → register an app → copy its config.
   4. Replace the placeholder values below with yours.
   5. Firestore → Rules → paste the RULES block at the bottom of this file → Publish.
      (Optional but tidy) Firestore → Data → create collection "polls",
      document "homepage", fields interactive/dossier/retro = 0. The poll also
      creates them on the first vote, so this step is optional.
   ──────────────────────────────────────────────────────────────────────────── */

window.RB_FIREBASE_CONFIG = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

/* ── Firestore security rules (Firestore → Rules) ────────────────────────────
   Scopes all access to the single poll document; it stores only three integer
   counts (no personal data), so open read/write on that one doc is fine for a
   public poll. Everything else in the database stays locked.

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /polls/homepage {
      allow read: if true;
      allow write: if request.resource.data.keys().hasOnly(['interactive','dossier','retro']);
    }
    match /{document=**} { allow read, write: if false; }
  }
}
──────────────────────────────────────────────────────────────────────────── */

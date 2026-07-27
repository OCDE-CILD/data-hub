// ─────────────────────────────────────────────────────────────────────────
// Firebase config & access rules for the OCDE Data Hub preview gate.
// This file is shared by login.html and auth-check.js — edit it in one
// place and both pick up the change.
// ─────────────────────────────────────────────────────────────────────────

// 1. Paste your Firebase project's config object here.
//    Firebase Console → Project settings → General → "Your apps" → SDK setup.
export const firebaseConfig = {
  apiKey: "AIzaSyAbkm0RQooAzqpPFT6oYr9_uOBisrpz3qE",
  authDomain: "data-hub-5e53b.firebaseapp.com",
  projectId: "data-hub-5e53b",
  storageBucket: "data-hub-5e53b.firebasestorage.app",
  messagingSenderId: "695805489729",
  appId: "1:695805489729:web:d7b21c5abae22a5f3c0cc0",
};

// 2. Google Identity Services client ID (used for sign-in directly via
//    Google's own library, bypassing Firebase's popup/redirect flow so the
//    site's URL and hosting can stay on GitHub Pages).
//    Firebase Console → Authentication → Sign-in method → Google →
//    Web SDK configuration → Web client ID.
export const GOOGLE_CLIENT_ID =
  "695805489729-4ch7erkgcoeg85vvnn23am9ca6j3ogg8.apps.googleusercontent.com";

// 3. Who's allowed in. Leave an array empty to skip that check entirely.
//
//    ALLOWED_DOMAINS  – Google Workspace domains to accept, e.g. ["ocde.us"].
//                        Anyone signing in with a matching domain gets in.
//    ALLOWED_EMAILS   – specific personal/individual addresses to accept
//                        even if their domain isn't in ALLOWED_DOMAINS
//                        (useful for outside reviewers on a pilot).
//
//    A signed-in user is authorized if EITHER list matches. If both lists
//    are empty, anyone with a Google account can get in (not recommended).
export const ALLOWED_DOMAINS = [];

export const ALLOWED_EMAILS = [
  "jaubele@ocde.us",
  "ctrejo@ocde.us",
  "cmitchell@ocde.us",
  "aroy@ocde.us",
  "DBalasuriya@ocde.us",
  "DEhrle@ocde.us",
  "kbenaraw@ocde.us",
  "shlee@ocde.us",
  "jswanson@ocde.us",
  "sbean@ocde.us",
  "CMunoz@ocde.us",
  "kshillito@ocde.us",
  "jalberts@ocde.us",
  "lmakely@ocde.us",
  "spreciado@ocde.us"
  // add one address per line
];

// 4. Where the login page lives, relative to the site root. Used by
//    auth-check.js to build the correct redirect path from any page depth.
export const LOGIN_PATH_FROM_ROOT = "login.html";

// ─────────────────────────────────────────────────────────────────────────
// Shared helper — do not need to edit below this line.
// ─────────────────────────────────────────────────────────────────────────
export function isAuthorized(user) {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase();
  const domain = email.split("@")[1] || "";

  if (ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes(email)) return true;
  if (ALLOWED_DOMAINS.map((d) => d.toLowerCase()).includes(domain)) return true;

  return false;
}
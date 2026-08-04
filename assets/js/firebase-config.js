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
  "spreciado@ocde.us",
  "lduran@ocde.us",
  "spaul@ocde.us",
  "rmundschau@ocde.us",
  "krkim@ocde.us",
  "kleal@ocde.us",
  "MIwatani@ocde.us",
  "jsflores@ocde.us",
  "RLee@ocde.us",
  "ergarza@ocde.us",
  "hmetcalf@ocde.us",
  "JAwrey@ocde.us",
  "vflores@ocde.us",
  "sgooch@ocde.us",
  "LLanier@ocde.us",
  "jacquelinecardenas@ocde.us",
  "lkain@ocde.us",
  "bnguyen@ocde.us",
  "dmahmood@ocde.us",
  "akim@ocde.us",
  "dnicholas@ocde.us",
  "sludovise@ocde.us",
  "MAtkinson@ocde.us",
  "YDheming@ocde.us",
  "JGuarino@ocde.us",
  "cgonzalez-limas@ocde.us",
  "CSanchez@ocde.us",
  "stfitzpatrick@ocde.us",
  "DHarshman@ocde.us",
  "vreischl@ocde.us",
  "KBeck@ocde.us",
  "jannykim@ocde.us",
  "smarvicsin@ocde.us",
  "zpettitt@ocde.us",
  "MCasalino@ocde.us",
  "jheimer@ocde.us",
  "tphu@ocde.us",
  "areeds@ocde.us",
  "megarcia@ocde.us",
  "TKing@ocde.us",
  "RWest@ocde.us",
  "jkatevas@ocde.us",
  "PRomero@ocde.us",
  "CCherry@ocde.us",
  "sekahn@ocde.us",
  "SLambert@ocde.us",
  "CLaehle@ocde.us",
  "JPrice@ocde.us",
  "bgomez@ocde.us",
  "srock@ocde.us",
  "JIbarra@ocde.us",
  "SLoscko@ocde.us",
  "AChastain@ocde.us",
  "SCline@ocde.us",
  "mgray@ocde.us",
  "DBalasuriya@ocde.us",
  "ctrejo@ocde.us",
  "cmunoz@ocde.us",
  "lmakely@ocde.us",
  "kshillito@ocde.us",
  "spreciado@ocde.us",
  "ltheorema@ocde.us",
  "jalberts@ocde.us",
  "salbertson@ocde.us",
  "rlewis@ocde.us",
  "nlohrenz@ocde.us",
  "KRamezani@ocde.us",
  "rrojas@ocde.us",
  "hvelasco@ocde.us",
  "kcrawford@ocde.us",
  "KTakenaga@ocde.us",
  "aviana@ocde.us",
  "LBubb@ocde.us",
  "jbarton@bousd.us",
  "emily.wolk@sausd.us",
  "sharon.bi@sausd.us",
  "sidhu_s@auhsd.us",
  "esther_s_kim@myfsd.org",
  "jjackson@ljsd.org",
  "shaol@orangeusd.org",
  "AmyA@UnitedWayOC.org"
  // add one address per line
];

// 4. Where the login page lives, relative to the site root. Used by
//    auth-check.js to build the correct redirect path from any page depth.
export const LOGIN_PATH_FROM_ROOT = "login.html";

// ─────────────────────────────────────────────────────────────────────────
// Shared helpers — do not need to edit below this line.
// ─────────────────────────────────────────────────────────────────────────

// Checks a raw email address (string) against the allowlist. Used both
// before we send a sign-in link (so we don't email someone not on the list)
// and after any sign-in method completes.
export function isEmailAllowed(email) {
  if (!email) return false;
  const normalized = email.toLowerCase();
  const domain = normalized.split("@")[1] || "";

  if (ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes(normalized)) return true;
  if (ALLOWED_DOMAINS.map((d) => d.toLowerCase()).includes(domain)) return true;

  return false;
}

// Checks a signed-in Firebase user object.
export function isAuthorized(user) {
  if (!user || !user.email) return false;
  return isEmailAllowed(user.email);
}
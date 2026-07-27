// ─────────────────────────────────────────────────────────────────────────
// auth-check.js
//
// Drop this on any page you want gated behind sign-in. It:
//   1. Keeps the page hidden (via the `auth-pending` class — see snippet
//      below) until we know whether the visitor is signed in.
//   2. If they're signed in AND on the allowlist (firebase-config.js),
//      reveals the page.
//   3. Otherwise, sends them to login.html.
//
// Required snippet in the <head> of every protected page, BEFORE this
// script tag:
//
//   <script>document.documentElement.classList.add('auth-pending');</script>
//   <style>html.auth-pending body { visibility: hidden; }</style>
//   <script type="module" src="assets/js/auth-check.js"></script>
//
// (adjust the src path depth — see PATH NOTES below)
// ─────────────────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { firebaseConfig, isAuthorized } from "./firebase-config.js";

// ── PATH NOTES ──────────────────────────────────────────────────────────
// This site serves pages from two depths: the root (index.html) and
// /pages/*.html (one level down), same pattern as nav.js. We figure out
// which one we're on so the redirect back to login.html always works,
// regardless of where this script is included from.
function getLoginUrl() {
  const path = window.location.pathname;
  const atRoot = /\/(index\.html)?$/.test(path) || path.endsWith("/data-hub/");
  const loginRelative = atRoot ? "login.html" : "../login.html";
  const next = encodeURIComponent(window.location.href);
  return `${loginRelative}?next=${next}`;
}

function revealPage() {
  document.documentElement.classList.remove("auth-pending");
}

function goToLogin(reason) {
  const url = getLoginUrl() + (reason ? `&reason=${reason}` : "");
  window.location.replace(url);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    goToLogin();
    return;
  }

  if (!isAuthorized(user)) {
    // Signed in with Google, but not on the allowlist — bounce them and
    // sign out so a stale session doesn't loop them back in silently.
    await signOut(auth);
    goToLogin("unauthorized");
    return;
  }

  revealPage();
});
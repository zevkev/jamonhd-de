// Public Firebase client config — these values identify the project to
// Google's servers, they don't authorize anything by themselves (actual
// access is governed by the Firestore security rules and Auth providers
// configured in the Firebase console). Same "safe to embed" status as
// FOURTHWALL_STOREFRONT_TOKEN in js/config.js.
//
// Deliberately the SAME Firebase project as zevkev.de (not a separate
// project for this site) — that's what makes a Medienspeicher account
// (profile, comments, watchlist) the same account on both sites. A visitor
// still has to sign in once per domain (Firebase Auth sessions are scoped
// per browser origin, not shared across two different apex domains), but
// it resolves to the identical uid/profile/comment history either way.
// Keep this file byte-identical to the copy in the zevkev-de repo if either
// ever changes.
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBklVTLWw5BwagKsjg8VplXb6R8X47bxgI",
  authDomain: "zevkev-de.firebaseapp.com",
  projectId: "zevkev-de",
  storageBucket: "zevkev-de.firebasestorage.app",
  messagingSenderId: "766382709287",
  appId: "1:766382709287:web:58b0df533ab70a3c618c02",
};

// Every account that gets comment-moderation powers (delete any comment,
// not just its own) across BOTH sites — mirrored by the Firestore security
// rules' isOwner() check, which is the actual enforcement; this constant
// just lets the UI decide whether to show delete buttons/the verified
// crown without a wasted round-trip the rules would reject anyway. Keep in
// sync with the identical array in the zevkev-de repo's own copy of this
// file (same project, so the list has to match on both sides or the rules
// and the UI disagree about who's an owner).
export const OWNER_EMAILS = ["kevlevin.zev@gmail.com", "jasontummes@gmail.com"];

// Public, read-only tokens only — Fourthwall's Storefront token is designed
// to be embedded in client-side code (product read + cart creation only).
// Real admin credentials must never go in a file like this.
// GitHub's push-protection scanner flags this token's ptkn_... format as a
// false-positive "Shopify App Client Credentials" match, blocking any push
// that includes the real value. Deliberately not routing around that with
// an obfuscated/encoded value -- that pattern is indistinguishable from
// actually hiding a secret, regardless of this specific token being public
// by design, so it's not something to do quietly from here. The real fix
// is for the repo owner to click through GitHub's own "allow this secret"
// flow once (Kevin has the URL from the blocked push), or paste the real
// value in directly via GitHub's web editor. Placeholder here until then.
export const FOURTHWALL_STOREFRONT_TOKEN = "ptkn_944b78e5-504c-4fca-a46e-4eec93ed3af4";

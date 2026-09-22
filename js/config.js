// Public, read-only tokens only — Fourthwall's Storefront token is designed
// to be embedded in client-side code (product read + cart creation only).
// Real admin credentials must never go in a file like this.
// GitHub's push-protection scanner flags this token's ptkn_... format as a
// false-positive "Shopify App Client Credentials" match, blocking any push
// that includes the real value -- see CLAUDE.md/commit history for how this
// got resolved. Placeholder here until that's sorted out.
export const FOURTHWALL_STOREFRONT_TOKEN = "ptkn_REPLACE_WITH_REAL_TOKEN";

# Jamon Website (jamonhd.de)

Read this first, then only the files a task touches.

## What this is

Static site for Jamon (Jason Marvin Tummes, YouTuber @jamon_hd: theme parks,
gaming, vlogs). Repo `github.com/zevkev/jamonhd-de`, managed by Kevin
(ZevKev), hosted on **GitHub Pages** (jamonhd.de). No server, no backend:
plain HTML + ES modules, Tailwind CSS v4 compiled in CI, data JSON refreshed
by a GitHub Actions cron, shop and checkout via Fourthwall
(checkout on shop.jamonhd.de).

Rebuilt on 2026-10-31 together with the sister site zevkev.de (repo
`I:\Claude\Website-ZevKev`, read its CLAUDE.md for shared lessons). Removed
the same day: accounts/login, comments, watchlist, watch pages, /privat/,
/profil/, Firebase, Google Analytics and the cookie banner.

**No cookies, no analytics, no consent banner.** localStorage is only
written when a visitor uses a feature (theme toggle `jamon-theme`, cart id).
Third-party requests on page load: YouTube thumbnails (YouTube page),
Fourthwall API/images (shop pages). Discord stats and the server icon are
fetched by CI and served from this site. Keep `datenschutz/` in sync with
any change to this.

## Owner rules

- German, casual UI copy. **No emojis** (`js/text.js` `cleanText()` strips
  them from video titles). **No dashes as punctuation** in copy.
- Text and headings always sit on a surface (ticket, signboard), never
  directly on the page background.
- Own identity, NOT a copy of zevkev.de: **theme park ticket**. Park-map
  background with contour lines (one element paints it, no seams), ticket
  cards with punched notches + perforation, die-cut stickers, signboards for
  section titles, arcade push buttons, floating capsule header (text logo
  "Jamon" + green "HD" tag, no image), ticket-stub footer. Fonts Bricolage
  Grotesque (display) + Figtree (body), self-hosted. Jamon green + coaster
  yellow; dark mode is "the park at night" (deep green, no brown/olive).
- Videos link straight to YouTube in the same tab; no modals or watch pages.
- Team roles (shared with zevkev.de): ZevKev Leitung (blue #1e88e5), Jamon
  Co Owner (green #22a06b), Belloflo Mitglied (red #e5484d).

## Switches editable in the GitHub web UI

| File | Effect |
|---|---|
| `aktion.txt` | Shop promo banner: `aktiv = ja/nein`, `text`, `code`, `bis = JJJJ-MM-TT`. |

## Architecture map

| Path | What it is |
|---|---|
| `src/app.css` | Design system: tokens (light `:root`, dark `[data-theme="dark"]`), Tailwind theme, components (`.ticket*`, `.sticker`, `.signboard`, `.btn*`, `.badge`, `.stamp`, `.kicker`, `.seg`, `.video-card`, `.reveal`, `.toast`, header/footer chrome). Imports `src/pages/*.css`. |
| `assets/css/app.css` | Generated (`npm run build`), gitignored, built in `deploy.yml`, which also appends `?v=<commit>` to the CSS link (Pages caches 10 min). |
| `js/boot.js`, `js/theme.js`, `js/layout.js`, `js/reveal.js`, `js/text.js` | Theme before paint; toggle; header/footer/mobile nav/cart button (mounts on import); scroll reveal; emoji cleaning. |
| `index.html` + `js/home.js` | Homepage incl. Discord invite with stats from `assets/data/discord.json`. |
| `shop/`, `js/catalog.js`, `js/product.js`, `js/cart.js`, `js/fourthwall-api.js`, `js/currency.js` | Shop, product page, cart drawer (logic ported from zevkev.de, proven against the live API). |
| `404.html` | Pages fallback: `/shop/<slug>` product pages, old `/video/<id>/` to YouTube, removed account pages to `/`. |
| `youtube/` + `js/youtube.js` | Channel page (data `assets/data/main-videos.json`, RSS, latest ~15). |
| `fourthwall-redirect*.html` | Snippets pasted into Fourthwall's own theme (shop.jamonhd.de -> jamonhd.de/shop). Not part of the site design, don't restyle. |
| `scripts/*.mjs` + `.github/workflows/data-refresh.yml` | Every 30 min: YouTube RSS feed, Discord invite stats. |
| `tools/serve.mjs` | Local preview that behaves like GitHub Pages (404 fallback, no cache): `node tools/serve.mjs 8200`. |

## Fourthwall facts

Same as zevkev.de: prices requested with `currency=EUR`; carts only via POST
`/carts`, `/add`, `/change`, `/remove` (PUT/PATCH/DELETE blocked at their
edge); API pages 10 items, use `size`/`page`; variant images per colour.

## Testing

`npm install`, `npm run dev` (Tailwind watch), `node tools/serve.mjs 8200`.
Headless checks with zevkev.de's `tools/cdp-shot.mjs` (console errors, HTTP
errors, `--mobile` phone emulation). Always check light + dark, desktop +
320/390px phones and that nothing scrolls sideways.

## Do not

- Type passwords, API keys or secrets into forms for Kevin or Jamon.
- Invent legal text. Widerrufsbelehrung needs a professional.
- Add a backend, accounts, analytics or anything that sets cookies.

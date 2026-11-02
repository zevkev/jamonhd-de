// Shop overview (/shop/): promo banner from /aktion.txt, collection filters
// and the product grid. Cards link to the clean product URL /shop/<slug>,
// which GitHub Pages serves through the root 404.html (see js/product.js).
import { FourthwallAPI, productSoldOut, priceSummary, variantOnSale, imagesForColor, productColors, plainText } from "/js/fourthwall-api.js";
import { money } from "/js/currency.js";
import { escapeHTML, nameHTML, showToast, alignNotch, ICON } from "/js/cart.js";
import { initReveal } from "/js/reveal.js";

const grid = document.getElementById("product-grid");
const filterBar = document.getElementById("shop-filters");

// ---------- Promo banner (/aktion.txt) ----------
// The owner edits /aktion.txt in the GitHub web UI. Lines are
// "key = value", "#" starts a comment line, keys are case insensitive.
// Shown only when aktiv = ja, text is set and the optional "bis" date
// (JJJJ-MM-TT, inclusive, local time) has not passed. A missing or broken
// file simply means no banner.
export function parseAktion(text) {
  const data = {};
  for (const raw of String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    data[line.slice(0, eq).trim().toLowerCase()] = line.slice(eq + 1).trim();
  }
  return data;
}

// End of the given day in local time, or null when the date is unreadable.
// Accepts the documented 2026-11-30 and, to be forgiving, 30.11.2026.
function endOfDay(value) {
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
  let y, mo, d;
  if (m) [, y, mo, d] = m.map(Number);
  else if ((m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value))) [, d, mo, y] = m.map(Number);
  else return null;
  const end = new Date(y, mo - 1, d, 23, 59, 59, 999);
  return end.getFullYear() === y && end.getMonth() === mo - 1 && end.getDate() === d ? end : null;
}

export function activePromo(data, now = new Date()) {
  if ((data.aktiv || "").toLowerCase() !== "ja") return null;
  if (!data.text) return null;
  if (data.bis) {
    const end = endOfDay(data.bis);
    if (!end || now > end) return null;
  }
  return { text: data.text, code: data.code || "" };
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {}
    area.remove();
    return ok;
  }
}

async function loadPromo() {
  const slot = document.getElementById("shop-promo");
  if (!slot) return;
  let promo = null;
  try {
    const res = await fetch("/aktion.txt", { cache: "no-cache" });
    if (res.ok) promo = activePromo(parseAktion(await res.text()));
  } catch {}
  if (!promo) return;

  // Built from elements and textContent only, the file's values are never
  // parsed as HTML.
  const box = document.createElement("div");
  box.className = "shop-promo";
  box.innerHTML = `
    <span class="shop-promo-icon" aria-hidden="true">${ICON.ticket}</span>
    <p class="shop-promo-text"></p>`;
  box.querySelector(".shop-promo-text").textContent = plainText(promo.text);

  if (promo.code) {
    const codeRow = document.createElement("div");
    codeRow.className = "shop-promo-code";
    codeRow.innerHTML = `<span class="text-sm font-bold">Code:</span><strong class="shop-promo-chip"></strong>
      <button type="button" class="btn btn-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>
        <span>Kopieren</span>
      </button>`;
    codeRow.querySelector(".shop-promo-chip").textContent = promo.code;
    const button = codeRow.querySelector("button");
    button.setAttribute("aria-label", `Code ${promo.code} kopieren`);
    button.addEventListener("click", async () => {
      const ok = await copyText(promo.code);
      showToast(ok ? "Code kopiert. Gib ihn an der Kasse ein." : `Kopieren ging nicht. Der Code ist ${promo.code}.`, ok ? "info" : "error");
    });
    box.appendChild(codeRow);
  }

  slot.replaceChildren(box);
  slot.hidden = false;
}

// ---------- Product grid ----------
const FLIP_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`;

function swatchColor(value) {
  return value && CSS.supports("color", value) ? value : "#bdbdbd";
}
function cardHTML(product) {
  const name = plainText(product.name) || "Produkt";
  const colors = productColors(product);
  const images = imagesForColor(product, colors[0]?.name);
  const primary = images[0]?.url || "";
  const second = images[1]?.url || "";
  const { variant, varies } = priceSummary(product);
  const currency = variant?.unitPrice?.currency || "EUR";
  const soldOut = productSoldOut(product);
  const sale = !soldOut && variantOnSale(variant);
  const href = `/shop/${encodeURIComponent(product.slug)}`;

  const badges = [
    soldOut ? `<span class="stamp shop-stamp shop-stamp-soldout">Ausverkauft</span>` : "",
    sale ? `<span class="stamp shop-stamp">Sale</span>` : "",
  ].join("");

  const dots = colors.length > 1
    ? `<span class="color-dots" role="img" aria-label="${colors.length} Farben">${colors
        .slice(0, 6)
        .map((c) => `<span class="color-dot" style="--swatch:${escapeHTML(swatchColor(c.swatch))}" title="${escapeHTML(c.name)}"></span>`)
        .join("")}${colors.length > 6 ? `<span class="text-xs font-bold text-ink-muted">+${colors.length - 6}</span>` : ""}</span>`
    : "";

  return `
  <article class="ticket ticket-lift product-card reveal${soldOut ? " is-soldout" : ""}">
    <div class="product-photo photo-stage">
      ${primary ? `<img class="product-img" src="${escapeHTML(primary)}" alt="${escapeHTML(name)}" loading="lazy" decoding="async">` : `<span class="product-img-missing" aria-hidden="true"></span>`}
      ${second ? `<img class="product-img product-img-alt" src="${escapeHTML(second)}" alt="" aria-hidden="true" loading="lazy" decoding="async">` : ""}
      ${badges ? `<div class="absolute left-2.5 top-2.5 z-[5] flex flex-col items-start gap-2">${badges}</div>` : ""}
      ${second ? `<button type="button" class="product-flip" aria-pressed="false" aria-label="Andere Ansicht von ${escapeHTML(name)} zeigen">${FLIP_ICON}</button>` : ""}
    </div>
    <hr class="ticket-perf product-perf" data-notch>
    <div class="product-stub">
      <h2 class="product-name"><a class="product-link" href="${href}">${nameHTML(name)}</a></h2>
      <div class="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-2">
        ${variant ? `<span class="price-tag">${varies ? `<span class="price-from">ab</span>` : ""}${money(variant.unitPrice?.value, currency)}</span>` : ""}
        ${sale ? `<s class="price-compare">${money(variant.compareAtPrice.value, currency)}</s>` : ""}
        ${dots}
      </div>
    </div>
  </article>`;
}

function renderGrid(products) {
  grid.removeAttribute("aria-busy");
  if (!products.length) {
    grid.innerHTML = stateCardHTML(
      "Hier ist gerade nichts",
      "Neuer Merch ist schon in Arbeit. Schau bald wieder vorbei."
    );
    return;
  }
  grid.innerHTML = products.map(cardHTML).join("");
  grid.querySelectorAll(".product-card").forEach(alignNotch);
  initReveal(grid);
}

function stateCardHTML(title, text, retry = false) {
  return `
  <div class="ticket ticket-plain col-span-full mx-auto w-full max-w-lg px-6 py-10 text-center sm:px-10">
    <span class="stamp">Pause</span>
    <h2 class="mt-4 text-3xl sm:text-4xl">${title}</h2>
    <p class="mt-3 text-ink-muted">${text}</p>
    ${retry ? `<button type="button" class="btn btn-brand mt-6" data-shop-retry>Nochmal versuchen</button>` : ""}
  </div>`;
}

function renderSkeleton() {
  grid.setAttribute("aria-busy", "true");
  grid.innerHTML = Array.from(
    { length: 6 },
    () => `<div class="ticket ticket-plain p-2 sm:p-2.5" aria-hidden="true"><div class="skeleton aspect-[3/4] w-full"></div><div class="px-1.5 pb-2 pt-4"><div class="skeleton h-5 w-3/4"></div><div class="skeleton mt-3 h-7 w-20"></div></div></div>`
  ).join("");
}

// ---------- Filters ----------
// Fourthwall's own catch-all collection ("All Products", slug "all") is the
// same list as the "Alle" filter, so it is never shown as its own filter.
// Collections that contain exactly the same products as "Alle" would be a
// second identical filter too, so they are skipped. The filter bar only
// appears once there is a collection that really narrows the list.
function isCatchAll(c) {
  return c.slug === "all" || /^(all products|alle produkte)$/i.test((c.name || "").trim());
}

function sameProducts(a, b) {
  if (a.length !== b.length) return false;
  const ids = new Set(a.map((p) => p.id));
  return b.every((p) => ids.has(p.id));
}

let filters = [];

function renderFilters(active) {
  if (!filterBar) return;
  if (filters.length < 2) {
    filterBar.hidden = true;
    return;
  }
  filterBar.innerHTML = filters
    .map(
      (f) =>
        `<button type="button" class="seg-item" data-filter="${escapeHTML(f.slug)}" aria-pressed="${f.slug === active}">${escapeHTML(plainText(f.name))} <span class="seg-count">${f.products.length}</span></button>`
    )
    .join("");
  filterBar.hidden = false;
}

function selectFilter(slug) {
  const f = filters.find((x) => x.slug === slug) || filters[0];
  if (!f) return;
  filterBar?.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === f.slug)));
  renderGrid(f.products);
}

async function loadCatalog() {
  renderSkeleton();
  try {
    const collections = await FourthwallAPI.getCollections();
    const catchAll = collections.find(isCatchAll);
    const others = collections.filter((c) => c !== catchAll);
    const [allList, ...lists] = await Promise.all([
      catchAll ? FourthwallAPI.getCollectionProducts(catchAll.slug) : null,
      ...others.map((c) => FourthwallAPI.getCollectionProducts(c.slug).catch(() => null)),
    ]);

    let all = allList;
    if (!all) {
      const seen = new Map();
      lists.flat().forEach((p) => p && !seen.has(p.id) && seen.set(p.id, p));
      all = [...seen.values()];
    }

    filters = [{ slug: "", name: "Alle", products: all }];
    others.forEach((c, i) => {
      const products = lists[i];
      if (products?.length && !sameProducts(products, all)) filters.push({ slug: c.slug, name: c.name, products });
    });

    renderFilters("");
    renderGrid(all);
  } catch (err) {
    console.error("Catalog load failed:", err);
    grid.removeAttribute("aria-busy");
    grid.innerHTML = stateCardHTML("Der Shop lädt gerade nicht", "Da hakt gerade was bei der Verbindung. Bitte versuch es gleich nochmal.", true);
  }
}

// ---------- Wiring ----------
filterBar?.addEventListener("click", (ev) => {
  const button = ev.target.closest("[data-filter]");
  if (button) selectFilter(button.dataset.filter);
});

grid?.addEventListener("click", (ev) => {
  const flip = ev.target.closest(".product-flip");
  if (flip) {
    const card = flip.closest(".product-card");
    const flipped = card.classList.toggle("is-flipped");
    flip.setAttribute("aria-pressed", String(flipped));
    return;
  }
  if (ev.target.closest("[data-shop-retry]")) loadCatalog();
});

if (grid) {
  alignNotch(document.getElementById("shop-ticket"));
  loadPromo();
  loadCatalog();
}

/* Pure Scents prototype behavior. No framework, no build step. */
(() => {
  const CATALOG = window.CATALOG || [];
  const FAMILIES = ["Fresh", "Floral", "Woody", "Amber", "Gourmand", "Oud & Spice"];
  const FAMILY_COPY = {
    Fresh: "Citrus, marine, green leaves",
    Floral: "Rose, jasmine, peony",
    Woody: "Cedar, vetiver, sandalwood",
    Amber: "Amber, musk, tonka",
    Gourmand: "Vanilla, caramel, coffee",
    "Oud & Spice": "Oud, saffron, smoke",
  };
  const STORES = [
    {
      id: "dearborn",
      city: "Dearborn",
      address: "7828 Wyoming Ave, Dearborn, MI 48126",
      phone: "(313) 733-7643",
      phoneHref: "tel:+13137337643",
      hours: [["Mon to Sat", "12 to 7 PM"], ["Sunday", "Closed"]],
      map: "https://www.google.com/maps/search/?api=1&query=7828+Wyoming+Ave+Dearborn+MI+48126",
    },
    {
      id: "detroit",
      city: "Detroit",
      address: "12300 E Warren Ave, Detroit, MI 48215",
      phone: "313-915-6290",
      phoneHref: "tel:+13139156290",
      hours: [["Mon to Thu", "12 to 7 PM"], ["Friday", "1 to 7 PM"], ["Saturday", "12 to 7 PM"], ["Sunday", "Closed"]],
      map: "https://www.google.com/maps/search/?api=1&query=12300+E+Warren+Ave+Detroit+MI+48215",
    },
  ];
  const SOCIAL = {
    instagram: "https://instagram.com/purescents",
    tiktok: "https://www.tiktok.com/@purescents",
    email: "purescentscompany@gmail.com",
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + Number(n).toFixed(2);
  const byHandle = new Map(CATALOG.map((p) => [p.handle, p]));
  const pad = (n) => String(n).padStart(2, "0");

  function labelName(p) {
    let n = p.name;
    if (p.house && p.house !== "Pure Scents" && n.toLowerCase().startsWith(p.house.toLowerCase())) {
      n = n.slice(p.house.length).trim();
    }
    if (n.length > 30) n = n.slice(0, 30).replace(/\s+\S*$/, "");
    return n;
  }

  function bottle(p, extra = "", eager = false) {
    return `<div class="bottle ${extra}" data-family="${esc(p.family)}">
      <img class="bottle__img" src="assets/img/bottle-cut.png" alt="Pure Scents bottle for ${esc(p.name)}" ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async">
      <div class="bottle__label" aria-hidden="true">
        <span class="bottle__no">${esc(p.index)}</span>
        <span class="bottle__name">${esc(labelName(p))}</span>
        <span class="bottle__fam">${esc(p.family === "Oud & Spice" ? "Oud" : p.family)}</span>
      </div>
    </div>`;
  }

  function notesLine(p) {
    const n = p.notes || {};
    const picks = [...(n.top || []).slice(0, 2), ...(n.base || []).slice(0, 1)];
    const list = picks.length ? picks : (n.heart || []).slice(0, 3);
    if (!list.length) return FAMILY_COPY[p.family] || "";
    return list.join(" · ");
  }

  function listPhrase(items) {
    const a = items.filter(Boolean).slice(0, 3).map((s) => s.toLowerCase());
    if (!a.length) return "";
    if (a.length === 1) return a[0];
    return a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
  }

  function describeProduct(p) {
    const n = p.notes || {};
    const fam = p.family === "Oud & Spice" ? "oud and spice" : p.family.toLowerCase();
    const houseNamed = p.house && p.name.toLowerCase().startsWith(p.house.toLowerCase());
    const intro = p.kind === "import"
      ? `an Arabian import${p.house && p.house !== "Arabian import" && !houseNamed ? " from " + p.house : ""}`
      : p.kind === "inspired"
        ? `a designer-inspired ${fam} blend`
        : `a Pure Scents original`;
    let s = `${p.name} is ${intro}.`;
    if ((n.top || []).length) s += ` It opens on ${listPhrase(n.top)}.`;
    if ((n.heart || []).length) s += ` The heart is ${listPhrase(n.heart)}.`;
    if ((n.base || []).length) s += ` It dries down to ${listPhrase(n.base)}.`;
    if (!(n.top || []).length && !(n.base || []).length) {
      s += ` A ${fam} profile with a full tester on the shelf in Dearborn and Detroit.`;
    }
    return s;
  }

  function subline(p) {
    if (p.compareTo && p.compareTo.toLowerCase() !== p.name.toLowerCase()) return `Compare to ${p.compareTo}`;
    if (p.kind === "import") return "Arabian import";
    if (p.kind === "inspired") return "Designer inspired";
    return "Pure Scents original";
  }

  function priceLine(p) {
    const ml = p.defaultMl ? `${Math.round(p.defaultMl)} ml` : "";
    const ppm = p.pricePerMl ? `$${p.pricePerMl.toFixed(2)}/ml` : "";
    return `<span>${money(p.price)}</span><small>${[ml, ppm].filter(Boolean).join(" · ")}</small>`;
  }

  function card(p, eager = false) {
    return `<a class="scent-card" href="product.html?p=${encodeURIComponent(p.handle)}" data-family="${esc(p.family)}">
      <div class="bottle-wrap">${bottle(p, "", eager)}</div>
      <div class="scent-card__body">
        <div class="scent-card__top"><span>${esc(p.index)}</span><span class="fam">${esc(p.family === "Oud & Spice" ? "Oud" : p.family)}</span></div>
        <div class="scent-card__name">${esc(p.name)}</div>
        <div class="scent-card__compare">${esc(subline(p))}</div>
        <div class="scent-card__notes">${esc(notesLine(p))}</div>
        <div class="scent-card__price">${priceLine(p)}</div>
      </div>
    </a>`;
  }

  /* ---------- cart demo ---------- */
  function cartCount() {
    try { return Number(localStorage.getItem("ps_cart") || 0) || 0; } catch (e) { return 0; }
  }
  function setCart(n) {
    try { localStorage.setItem("ps_cart", String(n)); } catch (e) {}
    $$(".cart-count").forEach((el) => { el.textContent = n; el.hidden = n === 0; });
  }
  function addToCart(qty = 1, name = "") {
    const n = cartCount() + qty;
    setCart(n);
    toast(`${name ? esc(name) + " added. " : ""}${n} item${n === 1 ? "" : "s"} in cart. Checkout is part of the Shopify build.`);
  }

  let toastTimer;
  function toast(msg) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.dataset.show = "true";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.dataset.show = "false"; }, 3600);
  }

  /* ---------- chrome ---------- */
  const ICONS = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4.5 4.5"></path></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M5 7h14l-1 13H6L5 7z"></path><path d="M9 7V5a3 3 0 016 0v2"></path></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"></path></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"></path></svg>',
  };

  function navLink(href, label, page, key) {
    return `<li><a href="${href}" ${page === key ? 'aria-current="page"' : ""}>${label}</a></li>`;
  }

  function chromeTop(page) {
    return `<div class="demo-notice"><span>Unofficial design prototype for Pure Scents</span><span>Not the live store. No orders are placed.</span></div>
    <div class="announce">Free US shipping over $99 · Free pickup in Dearborn and Detroit</div>
    <header class="site-header">
      <div class="wrap header-inner">
        <a class="brand" href="index.html" aria-label="Pure Scents home">
          <span class="brand-mark"><img src="assets/img/icon.jpg" alt=""></span>
          <span class="brand-name">Pure Scents<small>The scent library</small></span>
        </a>
        <nav class="nav" aria-label="Main">
          <ul>
            ${navLink("shop.html", "Shop", page, "shop")}
            ${navLink("index.html#families", "Scent families", page, "families")}
            ${navLink("mixology.html", "Mixology", page, "mixology")}
            ${navLink("stores.html", "Stores", page, "stores")}
            ${navLink("info.html", "Help", page, "help")}
          </ul>
        </nav>
        <div class="header-actions">
          <button class="icon-btn menu-btn" data-menu-open aria-label="Open menu">${ICONS.menu}</button>
          <button class="icon-btn" data-search-open aria-label="Search">${ICONS.search}</button>
          <button class="icon-btn" data-cart-open aria-label="Cart">${ICONS.bag}<span class="cart-count" hidden>0</span></button>
        </div>
      </div>
    </header>
    <div class="scrim" data-scrim></div>
    <aside class="drawer" data-drawer aria-hidden="true" aria-label="Menu">
      <div class="drawer-top">
        <span class="brand-name">Pure Scents</span>
        <button class="icon-btn" data-menu-close aria-label="Close menu" style="color:var(--cream)">${ICONS.close}</button>
      </div>
      <nav class="drawer-nav">
        <a href="shop.html">Shop all</a>
        <a href="mixology.html">Mixology</a>
        <a href="stores.html">Stores</a>
        <a href="info.html">Help and policies</a>
      </nav>
      <div class="drawer-fams">
        ${FAMILIES.map((f) => `<a href="shop.html?family=${encodeURIComponent(f)}">${esc(f)}</a>`).join("")}
      </div>
      <div class="drawer-meta">
        Dearborn · 7828 Wyoming Ave<br>
        Detroit · 12300 E Warren Ave<br>
        ${SOCIAL.email}
      </div>
    </aside>
    <div class="search-panel" data-search aria-hidden="true">
      <div class="search-top">
        <span class="eyebrow">Search the library</span>
        <button class="icon-btn" data-search-close aria-label="Close search">${ICONS.close}</button>
      </div>
      <form class="search-form" data-search-form>
        <input type="search" name="q" placeholder="Try oud, vanilla, or Black Opium" autocomplete="off" aria-label="Search fragrances">
      </form>
      <div class="search-results" data-search-results></div>
    </div>`;
  }

  function chromeFooter() {
    return `<footer class="site-footer">
      <div class="wrap">
        <div class="footer-grid">
          <div class="footer-brand">
            <span class="brand-name">Pure Scents</span>
            <p>Designer-inspired fragrance, body care and custom blending. Two stores in Michigan, shipping across the US.</p>
          </div>
          <div class="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><a href="shop.html">All fragrances</a></li>
              <li><a href="shop.html?gender=Men">For him</a></li>
              <li><a href="shop.html?gender=Women">For her</a></li>
              <li><a href="shop.html?family=Oud%20%26%20Spice">Oud and spice</a></li>
              <li><a href="shop.html?sort=price-asc">Under $30</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Visit</h4>
            <ul>
              <li><a href="stores.html#dearborn">Dearborn store</a></li>
              <li><a href="stores.html#detroit">Detroit store</a></li>
              <li><a href="mixology.html">Book Mixology</a></li>
              <li><a href="stores.html#contact">Contact</a></li>
            </ul>
          </div>
          <div class="footer-col footer-news">
            <h4>10% off your first order</h4>
            <form data-newsletter>
              <input type="email" required placeholder="Email address" aria-label="Email address">
              <button class="btn" type="submit">Join the list</button>
            </form>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Pure Scents</span>
          <span><a href="info.html#shipping">Shipping</a> · <a href="info.html#returns">Returns</a> · <a href="info.html#faq">FAQ</a> · <a href="info.html#privacy">Privacy</a></span>
          <span><a href="${SOCIAL.instagram}" target="_blank" rel="noopener">Instagram</a> · <a href="${SOCIAL.tiktok}" target="_blank" rel="noopener">TikTok</a></span>
        </div>
      </div>
    </footer>
`;
  }

  function renderChrome(page) {
    const top = $("#chrome-top");
    const bottom = $("#chrome-bottom");
    if (top) top.innerHTML = chromeTop(page);
    if (bottom) bottom.innerHTML = chromeFooter();
    setCart(cartCount());

    const drawer = $("[data-drawer]");
    const scrim = $("[data-scrim]");
    const search = $("[data-search]");
    const setDrawer = (open) => {
      drawer.dataset.open = String(open);
      drawer.setAttribute("aria-hidden", String(!open));
      scrim.dataset.open = String(open);
      document.body.classList.toggle("no-scroll", open);
    };
    const setSearch = (open) => {
      search.dataset.open = String(open);
      search.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("no-scroll", open);
      if (open) setTimeout(() => $("[data-search-form] input")?.focus(), 120);
    };
    $("[data-menu-open]")?.addEventListener("click", () => setDrawer(true));
    $("[data-menu-close]")?.addEventListener("click", () => setDrawer(false));
    scrim?.addEventListener("click", () => { setDrawer(false); setSearch(false); });
    $("[data-search-open]")?.addEventListener("click", () => setSearch(true));
    $("[data-search-close]")?.addEventListener("click", () => { setSearch(false); $("[data-search-results]").innerHTML = ""; });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { setDrawer(false); setSearch(false); }
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) { e.preventDefault(); setSearch(true); }
    });
    $("[data-cart-open]")?.addEventListener("click", () => {
      const n = cartCount();
      toast(n ? `${n} item${n === 1 ? "" : "s"} in cart. Checkout ships with the Shopify build.` : "Your cart is empty. Add a scent to try the flow.");
    });
    $("[data-search-form]")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = new FormData(e.currentTarget).get("q").trim();
      if (q) location.href = `shop.html?q=${encodeURIComponent(q)}`;
    });
    $("[data-search-form] input")?.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      const out = $("[data-search-results]");
      if (!q) { out.innerHTML = ""; return; }
      const hits = CATALOG.filter((p) => searchBlob(p).includes(q)).slice(0, 8);
      out.innerHTML = hits.length ? hits.map((p) => `<a class="search-result" href="product.html?p=${encodeURIComponent(p.handle)}" data-family="${esc(p.family)}">
        ${bottle(p, "", false)}
        <span><b>${esc(p.name)}</b><small>${esc(p.family)} · ${esc(p.index)}</small></span>
        <span class="mono">${money(p.price)}</span>
      </a>`).join("") : `<p class="search-empty">No scent matches "${esc(q)}". Try a note like vanilla, or browse the library.</p>`;
    });
    $$("[data-newsletter]").forEach((form) => form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.reset();
      toast("You are on the list. The welcome code is part of the Shopify build.");
    }));
  }

  function searchBlob(p) {
    const notes = p.notes || {};
    return [p.name, p.compareTo, p.house, p.family, p.gender, ...(notes.top || []), ...(notes.heart || []), ...(notes.base || [])]
      .join(" ").toLowerCase();
  }

  /* ---------- home ---------- */
  function initHome() {
    const mount = $("[data-hero-bottle]");
    if (mount) {
      const hero = CATALOG.find((p) => p.name === "Amber White") || CATALOG.find((p) => p.featured) || CATALOG[0];
      mount.innerHTML = bottle(hero, "bottle--xl", true);
      const note = $("[data-hero-note]");
      if (note) note.innerHTML = `<b>${esc(hero.name)}</b>${esc(hero.index)}<br>${esc(hero.family)} · ${esc(notesLine(hero))}`;
    }
    const famMount = $("[data-families]");
    if (famMount) {
      famMount.innerHTML = FAMILIES.map((f) => {
        const count = CATALOG.filter((p) => p.family === f).length;
        return `<a class="family-tile" data-family="${esc(f)}" href="shop.html?family=${encodeURIComponent(f)}">
          <span class="family-count">${count} scents</span>
          <div class="family-bottom">
            <div class="family-name">${esc(f)}</div>
            <div class="family-desc">${esc(FAMILY_COPY[f])}</div>
          </div>
        </a>`;
      }).join("");
    }
    const best = $("[data-best]");
    if (best) best.innerHTML = CATALOG.filter((p) => p.featured).slice(0, 8).map((p) => card(p)).join("");
  }

  /* ---------- shop ---------- */
  function initShop() {
    const grid = $("[data-shop-grid]");
    const countEl = $("[data-shop-count]");
    const searchEl = $("[data-shop-search]");
    const sortEl = $("[data-shop-sort]");
    const genderEl = $("[data-shop-gender]");
    const priceEl = $("[data-shop-price]");
    const params = new URLSearchParams(location.search);
    const state = {
      family: params.get("family") || "All",
      gender: params.get("gender") || "All",
      price: params.get("price") || "All",
      sort: params.get("sort") || "featured",
      q: params.get("q") || "",
    };
    if (!FAMILIES.includes(state.family)) state.family = "All";
    searchEl.value = state.q;
    genderEl.value = state.gender === "Men" || state.gender === "Women" ? state.gender : "All";
    sortEl.value = state.sort;

    const chips = $("[data-family-chips]");
    chips.innerHTML = ["All", ...FAMILIES].map((f) => `<button class="chip" type="button" data-family-chip="${esc(f)}" aria-pressed="${state.family === f}">${esc(f)}</button>`).join("");

    function apply() {
      let rows = CATALOG.slice();
      if (state.family !== "All") rows = rows.filter((p) => p.family === state.family);
      if (state.gender !== "All") rows = rows.filter((p) => p.gender === state.gender || p.gender === "Unisex");
      if (state.price !== "All") {
        rows = rows.filter((p) => {
          if (state.price === "under15") return p.price < 15;
          if (state.price === "15to25") return p.price >= 15 && p.price < 25;
          if (state.price === "25to35") return p.price >= 25 && p.price < 35;
          if (state.price === "35plus") return p.price >= 35;
          return true;
        });
      }
      if (state.q) {
        const q = state.q.toLowerCase();
        rows = rows.filter((p) => searchBlob(p).includes(q));
      }
      if (state.sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
      if (state.sort === "price-asc") rows.sort((a, b) => a.price - b.price);
      if (state.sort === "price-desc") rows.sort((a, b) => b.price - a.price);
      if (state.sort === "featured") rows.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
      grid.innerHTML = rows.length ? rows.map((p, i) => card(p, i < 4)).join("") : `<p class="shop-empty">No scents match those filters. Try clearing one.</p>`;
      countEl.textContent = `${rows.length} scent${rows.length === 1 ? "" : "s"}`;
      const qs = new URLSearchParams();
      if (state.family !== "All") qs.set("family", state.family);
      if (state.gender !== "All") qs.set("gender", state.gender);
      if (state.price !== "All") qs.set("price", state.price);
      if (state.sort !== "featured") qs.set("sort", state.sort);
      if (state.q) qs.set("q", state.q);
      history.replaceState(null, "", `shop.html${qs.toString() ? "?" + qs : ""}`);
    }

    chips.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-family-chip]");
      if (!btn) return;
      state.family = btn.dataset.familyChip;
      $$("[data-family-chip]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      apply();
    });
    searchEl.addEventListener("input", () => { state.q = searchEl.value.trim(); apply(); });
    genderEl.addEventListener("change", () => { state.gender = genderEl.value; apply(); });
    priceEl.addEventListener("change", () => { state.price = priceEl.value; apply(); });
    sortEl.addEventListener("change", () => { state.sort = sortEl.value; apply(); });
    apply();
  }

  /* ---------- product ---------- */
  function initProduct() {
    const root = $("[data-pdp]");
    const handle = new URLSearchParams(location.search).get("p");
    const p = byHandle.get(handle);
    if (!p) {
      root.innerHTML = `<div class="wrap" style="padding:80px 0"><p class="eyebrow">Not found</p><h1 style="margin:12px 0 18px">That scent is not in the library.</h1><a class="btn" href="shop.html">Browse all scents</a></div>`;
      return;
    }
    document.title = `${p.name} | Pure Scents`;
    const related = CATALOG.filter((x) => x.family === p.family && x.handle !== p.handle).slice(0, 4);
    const compare = p.kind === "import"
      ? `Arabian import${p.house && p.house !== "Arabian import" ? " · " + p.house : ""}`
      : p.compareTo
        ? `Pure Scents interpretation${p.compareTo.toLowerCase() !== p.name.toLowerCase() ? " of " + p.compareTo : ""}`
        : "A Pure Scents original blend";
    const topNotes = (p.notes && p.notes.top) || [];
    const heartNotes = (p.notes && p.notes.heart) || [];
    const baseNotes = (p.notes && p.notes.base) || [];
    const hasNotes = topNotes.length || heartNotes.length || baseNotes.length;
    const desc = describeProduct(p);
    const sizeVariants = p.variants.filter((v) => !/butter|shea|cream|lotion|soap|body/i.test(v.label));
    const extras = p.variants.filter((v) => /butter|shea|cream|lotion|soap|body/i.test(v.label));
    const buyVariants = sizeVariants.length ? sizeVariants : p.variants;

    root.innerHTML = `<div class="wrap">
      <div class="pdp-top"><nav class="breadcrumb"><a href="index.html">Home</a><span>/</span><a href="shop.html">Shop</a><span>/</span><a href="shop.html?family=${encodeURIComponent(p.family)}">${esc(p.family)}</a><span>/</span><span>${esc(p.name)}</span></nav></div>
      <div class="pdp" data-family="${esc(p.family)}">
        <div class="pdp-visual">
          <span class="pdp-badge">${esc(p.index)}</span>
          ${bottle(p, "bottle--lg", true)}
        </div>
        <div class="pdp-details">
          <div class="pdp-index"><span>${esc(p.family)}</span><span>${esc(p.gender)}</span><span>${esc(p.strength)}</span></div>
          <h1>${esc(p.name)}</h1>
          <p class="pdp-compare">${esc(compare)}</p>
          <div class="pdp-tags">
            <span class="tag">${esc(p.gender)}</span>
            <span class="tag">${esc(p.family)}</span>
            <span class="tag">${esc(p.strength)}</span>
          </div>
          <div class="pdp-price"><span data-pdp-price>${money(p.price)}</span><small data-pdp-ppm>${p.defaultMl ? `${Math.round(p.defaultMl)} ml · $${p.pricePerMl.toFixed(2)}/ml` : ""}</small></div>
          <p class="pdp-desc">${esc(desc)}</p>
          <div class="sizes" role="radiogroup" aria-label="Size">
            ${buyVariants.map((v, i) => `<label class="size-option">
              <input type="radio" name="size" value="${i}" ${v.ml === p.defaultMl || (!p.defaultMl && i === 0) ? "checked" : ""}>
              <span class="dot" aria-hidden="true"></span>
              <b>${esc(v.label || `${Math.round(v.ml)} ml`)}</b>
              <span>${money(v.price)}</span>
            </label>`).join("")}
          </div>
          ${extras.length ? `<div class="pdp-extra">
            <span class="eyebrow">Also in this scent</span>
            ${extras.map((v, i) => `<div class="pdp-extra-row"><span>${esc(v.label)}</span><span class="mono">${money(v.price)}</span><button class="text-link" type="button" data-extra="${i}">Add</button></div>`).join("")}
          </div>` : ""}
          <div class="buy-row">
            <div class="qty">
              <button type="button" data-qty="-1" aria-label="Decrease quantity">−</button>
              <input type="number" value="1" min="1" max="9" aria-label="Quantity" data-qty-input>
              <button type="button" data-qty="1" aria-label="Increase quantity">+</button>
            </div>
            <button class="btn btn--accent" data-add>Add to cart</button>
          </div>
          <div class="pdp-promises">
            <span class="promise">Free US shipping over $99, flat rate below that.</span>
            <span class="promise">Free pickup at Dearborn or Detroit, usually ready in 24 hours.</span>
            <span class="promise">30-day returns on unopened bottles.</span>
          </div>
          <div class="pdp-accordions">
            <details open><summary>Scent profile</summary><div class="acc-body">${hasNotes ? "The note pyramid below is the full composition. Spray on skin, not fabric, and give it ten minutes to settle before judging the dry-down." : `A ${esc(p.family.toLowerCase())} blend. Ask for a tester in store to sample the full dry-down.`}</div></details>
            <details><summary>Shipping and pickup</summary><div class="acc-body">Orders leave the Dearborn store within one to two business days. Free US shipping over $99, flat rate below that. Pickup is free at either store and usually ready within 24 hours.</div></details>
            <details><summary>Returns</summary><div class="acc-body">Unopened bottles can be returned within 30 days. For hygiene reasons opened fragrance cannot be resold, so opened bottles are final sale. Damaged or wrong items are replaced.</div></details>
          </div>
        </div>
      </div>
    </div>
    <section class="notes-section"><div class="wrap">
      <div class="section-head"><div><span class="eyebrow">Composition</span><h2>What it is made of</h2></div><p class="muted">${hasNotes ? "Notes as listed by Pure Scents. Layering and skin chemistry change how each one reads." : "This scent does not have a published note breakdown yet."}</p></div>
      <div class="notes-grid">
        ${[["Top", topNotes], ["Heart", heartNotes], ["Base", baseNotes]].map(([label, list], i) => `<div class="note-col"><span class="eyebrow">0${i + 1}</span><h3>${label}</h3><div class="note-list">${list.length ? list.map((n) => `<span class="note-chip">${esc(n)}</span>`).join("") : `<span class="note-chip">${hasNotes ? "Not listed" : esc(FAMILY_COPY[p.family] || "Ask in store")}</span>`}</div></div>`).join("")}
      </div>
    </div></section>
    <section class="reviews-section"><div class="wrap">
      <div class="review-proof">
        <div><span class="eyebrow">In-store proof</span><div class="review-score">61 reviews</div><div class="review-meta">Loc8NearMe · Dearborn</div></div>
        <div class="review-notes">
          <p class="lede">Customers keep mentioning the same three things: fair prices, scents that last, and staff who know the shelf.</p>
          <div class="review-note"><b>On price</b>Amazing prices and a strong selection of oils and roll-ons.</div>
          <div class="review-note"><b>On longevity</b>Long-lasting scents that hold through a work day.</div>
          <div class="review-note"><b>On service</b>Helpful staff who take time to find the right match.</div>
          <p class="muted" style="font-size:12px">Review themes summarized from the public Loc8NearMe listing. Photo reviews and star ratings go live with the review app at launch.</p>
        </div>
      </div>
    </div></section>
    <section class="related"><div class="wrap">
      <div class="section-head"><div><span class="eyebrow">Same family</span><h2>More ${esc(p.family.toLowerCase())}</h2></div><a class="text-link" href="shop.html?family=${encodeURIComponent(p.family)}">See all ${esc(p.family)}</a></div>
      <div class="scent-grid">${related.map((x) => card(x)).join("")}</div>
    </div></section>
    <div class="buy-bar" data-buy-bar>
      <div><b>${esc(p.name)}</b><small data-buy-price>${money(p.price)}</small></div>
      <button class="btn btn--accent" data-add-bar>Add to cart</button>
    </div>`;

    let current = buyVariants.find((v) => v.ml === p.defaultMl) || buyVariants[0];
    const priceEl = $("[data-pdp-price]");
    const ppmEl = $("[data-pdp-ppm]");
    const buyPrice = $("[data-buy-price]");
    const setVariant = (v) => {
      current = v;
      priceEl.textContent = money(v.price);
      ppmEl.textContent = v.ml ? `${Math.round(v.ml)} ml · $${(v.price / v.ml).toFixed(2)}/ml` : "";
      buyPrice.textContent = `${money(v.price)} · ${esc(v.label)}`;
    };
    $$('input[name="size"]').forEach((input) => input.addEventListener("change", () => setVariant(buyVariants[Number(input.value)])));
    $$("[data-extra]").forEach((btn) => btn.addEventListener("click", () => addToCart(1, extras[Number(btn.dataset.extra)].label)));
    const qtyInput = $("[data-qty-input]");
    $$("[data-qty]").forEach((btn) => btn.addEventListener("click", () => {
      qtyInput.value = Math.min(9, Math.max(1, Number(qtyInput.value) + Number(btn.dataset.qty)));
    }));
    const add = () => addToCart(Math.max(1, Number(qtyInput.value) || 1), p.name);
    $("[data-add]").addEventListener("click", add);
    $("[data-add-bar]").addEventListener("click", add);

    const bar = $("[data-buy-bar]");
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        bar.dataset.show = String(!entries[0].isIntersecting && window.scrollY > 300);
      }, { threshold: 0 }).observe($(".buy-row"));
    }
  }

  /* ---------- forms ---------- */
  function initForms() {
    $$("[data-demo-form]").forEach((form) => form.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = form.dataset.demoForm || "Sent. This is a prototype, so nothing was submitted.";
      form.reset();
      toast(msg);
    }));
  }

  function initProposal() {
    $("[data-print]")?.addEventListener("click", () => window.print());
  }

  /* ---------- boot ---------- */
  const page = document.body.dataset.page || "";
  renderChrome(page);
  if (page === "home") initHome();
  if (page === "shop") initShop();
  if (page === "product") initProduct();
  initForms();
  if (page === "proposal") initProposal();
})();

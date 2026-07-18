/* Splendessa — "The 10 PM Client"
   Everything here is progressive enhancement: final values live in the HTML,
   the page reads correctly with JS disabled. */

"use strict";

const VELORA_DEMO_URL = "https://velora.splendessa.com";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbn6_WE5TwF0r12qE1k4s6MgwuoQH708js2exDXPyLCkOuCNy2tYpJzIN-__i5Ks3REw/exec";
const ITI_VERSION = "29.1.2"; // intl-tel-input CDN build, lazy-loaded near Section 04

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

/* =========================================================
   Diagnosis counters — 75 and 46 count up once the stats band
   scrolls into view. The 0 is NOT here: it has no data
   attribute, no selector matches it, ever. Under reduced
   motion nothing runs — final values live in the HTML.
   ========================================================= */
function animateCounters() {
  const els = document.querySelectorAll("[data-count]");
  if (reducedMotion) return; // final values are already in the HTML

  const DURATION = 1200;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  els.forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    el.textContent = "0";
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / DURATION, 1);
      el.textContent = String(Math.round(target * easeOutCubic(p)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
(function initCounters() {
  const band = document.querySelector("#diagnosis .counters");
  if (!band || reducedMotion) return;
  const countObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      countObserver.disconnect();
      // Wait for the real font (avoids a mid-count metric swap), capped at 400ms.
      Promise.race([
        document.fonts ? document.fonts.ready : Promise.resolve(),
        new Promise((r) => setTimeout(r, 400)),
      ]).then(animateCounters);
    },
    { threshold: 0.2 }
  );
  countObserver.observe(band);
})();

/* =========================================================
   Theme zones — charcoal ⇄ white, both scroll directions.
   A section claims the theme when it crosses the middle
   band of the viewport (rootMargin gives hysteresis).
   ========================================================= */
const zoneObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        document.body.dataset.theme = entry.target.dataset.zone;
      }
    });
  },
  { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
);
document.querySelectorAll("[data-zone]").forEach((s) => zoneObserver.observe(s));

/* =========================================================
   Scroll reveals — fade + 14px rise, once.
   ========================================================= */
if (reducedMotion) {
  document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("in"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));
}

/* =========================================================
   Diagnosis headline — scrubbed word-by-word fill. GSAP +
   ScrollTrigger load synchronously at the end of index.html,
   so both exist before this deferred script runs. Words start
   ~20% white and fill to their exact static colors (white
   lines → #FFFFFF, muted lines → #A6A3AD = --grey-on-dark),
   completing as the headline reaches ~center of the viewport.
   Reduced motion skips this entirely — the markup already
   carries the final colors.
   ========================================================= */
(function initHeadlineFill() {
  if (reducedMotion || !window.gsap || !window.ScrollTrigger) return;
  const copy = document.querySelector(".diagnosis-copy");
  if (!copy) return;
  gsap.registerPlugin(ScrollTrigger);

  const whiteWords = gsap.utils.toArray(".diagnosis h2 > span:not(.h2-muted) .fill-word");
  const greyWords = gsap.utils.toArray(".diagnosis h2 > .h2-muted .fill-word");

  gsap.set(whiteWords.concat(greyWords), { color: "rgba(255, 255, 255, 0.2)" });

  gsap.timeline({
    scrollTrigger: {
      trigger: copy,
      start: "clamp(top 85%)",
      // Complete when the headline is roughly centered (center at 55% of the
      // viewport), never in less than 240px of scroll, and always within the
      // page's real scroll bounds.
      end: () => {
        const rect = copy.getBoundingClientRect();
        const center = rect.top + window.scrollY + rect.height / 2;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        return Math.min(maxScroll, Math.max(240, Math.round(center - window.innerHeight * 0.55)));
      },
      scrub: true,
    },
    defaults: { ease: "none", duration: 0.3 },
  })
    .to(whiteWords, { color: "#FFFFFF", stagger: 0.18 })
    .to(greyWords, { color: "#A6A3AD", stagger: 0.18 }, ">-0.1");
})();

/* =========================================================
   03A — The Work: typographic demo list + project overlay.
   Ported 1:1 from prototypes/prototype-demolist.html: the
   comet-hover list, the cursor-follow preview, and the full
   project overlay (play pill, description, gallery, next-up
   curtain, overscroll-commit swap, hash/history, focus trap,
   reduced-motion fallbacks). The whole list is generated from
   the demos config below — editing a config line is the only
   change ever needed to add or update a demo.

   Site integration: GSAP is loaded ahead of this deferred
   script; token gradients use the site palette (--white,
   --grey-2, --ink, --rose); the overlay locks page scroll via
   html.ov-lock so the statusbar clock scrubber can't fight the
   overlay's internal scroller, and re-activates on close.
   ========================================================= */
(function initDemoList() {
  const list = document.getElementById("demoList");
  const preview = document.getElementById("preview");
  if (!list || !preview) return;

  // Every item opens the project overlay. url present → the hero and the
  // "see the demo •" button open it in a new tab; url null → overlay only,
  // click inert. image/heroImage/gallery null → generated placeholders.
  // description null → FALLBACK_DESC. Real content = editing config lines only.
  const FALLBACK_DESC = "A booking-first demo clinic by Splendessa."; // safety net for a demo added without a description
  const demos = [
    { name: "Velora",                 status: "live", url: "[URL-VELORA]", image: null, heroImage: null, gallery: null,
      description: "Velora is the AI MedSpa Engine — a clinic built around one idea: no client left waiting. Instant booking, automated follow-up, a site that works the night shift." },
    { name: "Lumina",                 status: "live", url: "[URL-LUMINA]", image: null, heroImage: null, gallery: null,
      description: "Lumina is the essential med spa landing, reduced to what converts. One page, one path, booked." },
    { name: "Maelis",                 status: "live", url: "[URL-MAELIS]", image: null, heroImage: null, gallery: null,
      description: "Maelis is the elite multi-service clinic — treatments, stories and booking woven into one editorial experience." },
    { name: "Dawn",                   status: "soon", url: null, image: null, heroImage: null, gallery: null,
      description: "Dawn is a clinic about starting over. Laser and resurfacing treatments framed as what they really are: your skin, beginning again." },
    { name: "Muse",                   status: "soon", url: null, image: null, heroImage: null, gallery: null,
      description: "Muse treats aesthetics as an art practice. A monochrome editorial clinic where every treatment reads like a piece in an exhibition." },
    { name: "Ember",                  status: "soon", url: null, image: null, heroImage: null, gallery: null,
      description: "Ember is warmth you can book. A luxury spa in terracotta and amber, built around the feeling that stays with you after you leave." },
    { name: "Golden Hour",            status: "soon", url: null, image: null, heroImage: null, gallery: null,
      description: "Golden Hour is a skincare clinic set in permanent perfect light. Facials and glow treatments designed around one promise: meet your best light." },
    { name: "Bare Beauty",            status: "soon", url: null, image: null, heroImage: null, gallery: null,
      description: "Bare Beauty is the anti-hype injectables clinic. Natural-look results, honest language, and a design stripped to what matters — less, done right." },
    { name: "Where Time Softens",     status: "soon", url: null, image: null, heroImage: null, gallery: null,
      description: "Where Time Softens is an anti-aging clinic with a different relationship to time. Nothing stops here — it just gets gentler." },
    { name: "The Face You Wake With", status: "soon", url: null, image: null, heroImage: null, gallery: null,
      description: "The Face You Wake With is a skin health clinic about the version of you before the mirror gets an opinion. Prevention first, honesty always." },
  ];

  const workHead = document.querySelector(".worklist-head");
  const section = document.getElementById("work");
  const mainEl = document.querySelector("main");
  const faces = preview.querySelectorAll(".face");

  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hasGsap = typeof window.gsap !== "undefined";
  const reduced = () => mqReduce.matches || !hasGsap;

  const slugOf = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const nextOf = (i) => (i + 1) % demos.length;

  function syncMotionClass() {
    document.documentElement.classList.toggle("no-anim", reduced());
  }
  syncMotionClass();

  const scroller = document.getElementById("ovScroll");
  // Native scroll everywhere — the reference has no inertial smoothing.
  function resetOvScroll() { scroller.scrollTop = 0; }

  // ============ placeholders (deterministic, site palette only) ============

  function phLight(seed, name) {
    const ph = document.createElement("div");
    ph.className = "ph";
    const angle = 115 + (seed * 37) % 90;
    const rosePct = [0, 4, 8, 6][seed % 4];
    const end = `color-mix(in srgb, var(--grey-2) ${100 - rosePct}%, var(--rose) ${rosePct}%)`;
    ph.style.background = `linear-gradient(${angle}deg, var(--white) 0%, ${end} 100%)`;
    const label = document.createElement("span");
    label.className = "ph-label";
    label.textContent = name;
    ph.appendChild(label);
    return ph;
  }

  function phDark(seed, name) {
    const ph = document.createElement("div");
    ph.className = "ov-hero-ph";
    const angle = 130 + (seed * 41) % 80;
    const rosePct = 8 + (seed % 3) * 3;
    const end = `color-mix(in srgb, var(--ink) ${100 - rosePct}%, var(--rose) ${rosePct}%)`;
    ph.style.background = `linear-gradient(${angle}deg, var(--ink) 20%, ${end} 100%)`;
    const wrap = document.createElement("span");
    wrap.className = "ov-hero-mark-wrap";
    const mark = document.createElement("span");
    mark.className = "ov-hero-mark";
    mark.textContent = name;
    wrap.appendChild(mark);
    ph.appendChild(wrap);
    return ph;
  }

  function mediaOrPh(src, seed, name) {
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      return img;
    }
    return phLight(seed, name);
  }

  // ============ the list — every row opens the overlay ============

  demos.forEach((demo, i) => {
    const li = document.createElement("li");
    const el = document.createElement("a");
    el.href = "#work/" + slugOf(demo.name);
    el.className = "demo-item";
    el.textContent = demo.name;
    el.dataset.index = i;
    li.appendChild(el);
    list.appendChild(li);
  });
  const rows = [...list.querySelectorAll("li")];

  // Rows fade in (no translate); they enter bright, then settle to dim.
  // Site adaptation: triggered when the section first scrolls into view
  // (the prototype ran it on load), and again on overlay-close.
  function listEnter(delay = 0) {
    if (reduced()) {
      if (hasGsap) gsap.set([workHead, ...rows], { clearProps: "all" });
      return;
    }
    const items = rows.map((li) => li.querySelector(".demo-item"));
    list.classList.add("entering");
    gsap.fromTo([workHead, ...rows], { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3, ease: "power1.out", stagger: 0.06, delay, overwrite: "auto" });
    gsap.fromTo(items, { color: "#17161A" }, {
      color: "#6E6A73", duration: 0.25, ease: "power1.out", stagger: 0.06,
      delay: delay + 0.2, clearProps: "color", overwrite: "auto",
      onComplete() { list.classList.remove("entering"); },
    });
  }
  if (!reduced() && section) {
    gsap.set([workHead, ...rows], { autoAlpha: 0 }); // hide until in view (no flash)
    const enterIO = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { enterIO.disconnect(); listEnter(0); }
    }, { threshold: 0.15 });
    enterIO.observe(section);
  }

  let quickX, quickY;
  if (hasGsap) {
    quickX = gsap.quickTo(preview, "x", { duration: 0.2, ease: "power3.out" });
    quickY = gsap.quickTo(preview, "y", { duration: 0.2, ease: "power3.out" });
  }

  let mx = 0, my = 0;
  let visible = false;
  let currentIndex = -1;
  let front = 0;

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

  function cursorTarget() {
    const w = preview.offsetWidth, h = preview.offsetHeight;
    let x = mx + 28;
    if (x + w > innerWidth - 16) x = mx - w - 28;
    return {
      x: clamp(x, 16, innerWidth - w - 16),
      y: clamp(my - h / 2, 16, innerHeight - h - 16),
    };
  }

  function itemTarget(item) {
    const w = preview.offsetWidth, h = preview.offsetHeight;
    const r = item.getBoundingClientRect();
    return {
      x: clamp(r.right + 24, 16, innerWidth - w - 16),
      y: clamp(r.top + r.height / 2 - h / 2, 16, innerHeight - h - 16),
    };
  }

  function snapTo(t) {
    if (hasGsap) {
      quickX(t.x);
      quickY(t.y);
      if (quickX.tween) quickX.tween.progress(1);
      if (quickY.tween) quickY.tween.progress(1);
    } else {
      preview.style.transform = `translate(${t.x}px, ${t.y}px)`;
    }
  }

  function showFor(item, docked) {
    const i = +item.dataset.index;
    if (i === currentIndex && visible) return;

    const wasVisible = visible;
    currentIndex = i;
    visible = true;

    const next = faces[1 - front];
    const prev = faces[front];
    next.replaceChildren(demos[i].image ? mediaOrPh(demos[i].image, i, demos[i].name) : phLight(i, demos[i].name));
    front = 1 - front;

    if (reduced()) {
      next.style.opacity = 1;
      prev.style.opacity = 0;
      snapTo(itemTarget(item));
      preview.style.opacity = 1;
      preview.style.visibility = "visible";
      return;
    }

    if (!wasVisible) {
      // First hover: fade in ~400ms, no scale.
      gsap.set(next, { opacity: 1 });
      gsap.set(prev, { opacity: 0 });
      snapTo(docked ? itemTarget(item) : cursorTarget());
      gsap.set(preview, { scale: 1 });
      gsap.to(preview, { autoAlpha: 1, duration: 0.4, ease: "power1.inOut", overwrite: "auto" });
    } else {
      // Between rows: pure crossfade, both faces at scale 1, no movement.
      gsap.set(next, { opacity: 0 });
      gsap.to(next, { opacity: 1, duration: 0.35, ease: "power1.inOut", overwrite: "auto" });
      gsap.to(prev, { opacity: 0, duration: 0.35, ease: "power1.inOut", overwrite: "auto" });
      if (docked) snapTo(itemTarget(item));
    }
  }

  function hidePreview() {
    if (!visible) return;
    visible = false;
    currentIndex = -1;
    if (reduced()) {
      preview.style.opacity = 0;
      preview.style.visibility = "hidden";
    } else {
      gsap.to(preview, { autoAlpha: 0, duration: 0.3, ease: "power1.inOut", overwrite: "auto" });
    }
  }

  list.addEventListener("mouseover", (e) => {
    const item = e.target.closest(".demo-item");
    if (!item) return; // between rows the preview never hides — it crossfades
    mx = e.clientX;
    my = e.clientY;
    showFor(item, reduced());
  });

  list.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!visible || reduced()) return;
    const t = cursorTarget();
    quickX(t.x);
    quickY(t.y);
  });

  list.addEventListener("mouseleave", hidePreview);

  list.addEventListener("focusin", (e) => {
    const item = e.target.closest(".demo-item");
    if (!item || !item.matches(":focus-visible")) return;
    showFor(item, true);
  });

  list.addEventListener("focusout", (e) => {
    if (!list.contains(e.relatedTarget)) hidePreview();
  });

  // ============ overlay ============

  const overlay = document.getElementById("overlay");
  const content = document.getElementById("ovContent");
  const ovBack = document.getElementById("ovBack");
  const ovClose = document.getElementById("ovClose");
  const ovHero = document.getElementById("ovHero");
  const ovHeroMedia = document.getElementById("ovHeroMedia");
  const ovTitle = document.getElementById("ovTitle");
  const ovText = document.getElementById("ovText");
  const ovSee = document.getElementById("ovSee");
  const ovGallery = document.getElementById("ovGallery");
  const ovNextWrap = document.getElementById("ovNextWrap");
  const ovNextSticky = document.getElementById("ovNextSticky");
  const ovNextCard = document.getElementById("ovNextCard");
  const ovNextMedia = document.getElementById("ovNextMedia");
  const ovNextTitle = document.getElementById("ovNextTitle");
  const ovProgress = document.getElementById("ovProgress");
  const ovProgressFill = document.getElementById("ovProgressFill");
  const ovWash = document.getElementById("ovWash");
  const ovSheet = overlay.querySelector(".ov-sheet");
  const scrollChip = overlay.querySelector(".ov-chip-scroll");
  const nextChip = overlay.querySelector(".ov-chip-next");
  const playChip = document.getElementById("playChip");

  let ovOpen = false;
  let ovDemo = -1;
  let openerEl = null;
  let swapping = false;
  let opening = false;
  // Overscroll-to-commit accumulator. Fires ONLY when the bar is completely
  // full (acc reaches COMMIT_ACC). Per-event contribution is capped so a
  // single hard fling can't fill it — the user has to keep pushing.
  const COMMIT_ACC = 420, GAIN = 0.33, PER_EVENT_CAP = 42, DECAY = 120;
  let acc = 0, lastInput = 0, pulseTween = null, atEnd = false;
  // Next-up chips are reactive to the card's revealed fraction: they pop on
  // the rising edge and hide when scrolled back below the trigger.
  let nextChipOn = false, scrollChipOn = false;

  // Gallery frame-expansion reveal, driven from the scroll handler: the clip
  // frame opens from a 12% inset while the zoomed inner image settles to 1.0.
  let pendingFigs = [];
  function checkFigReveals() {
    if (!pendingFigs.length) return;
    const vh = scroller.clientHeight;
    pendingFigs = pendingFigs.filter((fig) => {
      const r = fig.getBoundingClientRect();
      if (r.top < vh * 0.85) {
        gsap.to(fig, { clipPath: "inset(0% round 24px)", duration: 0.9, ease: "power2.out" });
        gsap.to(fig.firstElementChild, { scale: 1, duration: 0.9, ease: "power2.out" });
        return false;
      }
      return true;
    });
  }

  function renderDemo(i) {
    const d = demos[i];
    ovDemo = i;

    ovHeroMedia.replaceChildren(
      d.heroImage ? mediaOrPh(d.heroImage, i, d.name) : phDark(i, d.name)
    );
    // "see the demo •" renders on every demo (identical look). Only its click
    // is status-driven: url present → real link; url null → inert.
    if (d.url) {
      ovHero.classList.add("is-link");
      ovHero.setAttribute("role", "link");
      ovHero.tabIndex = 0;
      ovHero.setAttribute("aria-label", d.name + " — open the live demo in a new tab");
      ovSee.href = d.url;
    } else {
      ovHero.classList.remove("is-link");
      ovHero.removeAttribute("role");
      ovHero.tabIndex = -1;
      ovHero.setAttribute("aria-label", d.name);
      ovSee.removeAttribute("href");
    }

    ovTitle.textContent = d.name;
    ovText.textContent = d.description || FALLBACK_DESC;

    const shots = d.gallery && d.gallery.length ? d.gallery : [null, null, null];
    pendingFigs = [];
    ovGallery.replaceChildren(...shots.map((src, k) => {
      const fig = document.createElement("figure");
      fig.appendChild(mediaOrPh(src, i * 3 + k + 1, d.name));
      if (!reduced()) {
        gsap.set(fig, { clipPath: "inset(12% round 24px)" });
        gsap.set(fig.firstElementChild, { scale: 1.08, transformOrigin: "center" });
        pendingFigs.push(fig);
      }
      return fig;
    }));

    const n = nextOf(i);
    const nd = demos[n];
    ovNextMedia.replaceChildren(nd.image ? mediaOrPh(nd.image, n, nd.name) : phLight(n, nd.name));
    ovNextTitle.textContent = nd.name;
    ovNextCard.setAttribute("aria-label", "Next demo: " + nd.name);

    resetNextUp();
    setCloseVisible(true);
  }

  // × is a hero-only control: it fades away once the sheet takes over.
  let closeShown = true;
  function setCloseVisible(v) {
    if (v === closeShown) return;
    closeShown = v;
    if (reduced()) {
      ovClose.style.opacity = v ? 1 : 0;
      ovClose.style.visibility = v ? "visible" : "hidden";
    } else {
      gsap.to(ovClose, { autoAlpha: v ? 1 : 0, duration: 0.25, ease: "power2.out", overwrite: "auto" });
    }
  }

  function resetNextUp() {
    acc = 0;
    nextChipOn = false;
    scrollChipOn = false;
    if (pulseTween) { pulseTween.kill(); pulseTween = null; }
    ovProgress.classList.remove("on");
    ovProgressFill.style.transform = "scaleY(0)";
    if (hasGsap) {
      gsap.set(ovProgress, { clearProps: "opacity,visibility" });
      gsap.set(ovNextCard, { clearProps: "transform" });
      gsap.set(ovNextSticky, { clearProps: "transform,opacity,visibility" });
      if (!reduced()) gsap.set([nextChip, scrollChip], { autoAlpha: 0, scale: 0.6 });
      else gsap.set([nextChip, scrollChip], { clearProps: "opacity,visibility,transform" });
    }
  }

  // Edge-triggered chip: pops in (scale 0.6→1, back.out) on the rising edge,
  // hides on the falling edge; "keep scrolling !" idle-pulses.
  function toggleChip(el, on, isPulse) {
    if (on) {
      gsap.fromTo(el, { autoAlpha: 0, scale: 0.6 }, {
        autoAlpha: 1, scale: 1, duration: 0.2, ease: "back.out(2)", overwrite: "auto",
        onComplete() {
          if (isPulse) pulseTween = gsap.to(el, { scale: 1.035, duration: 1.1, yoyo: true, repeat: -1, ease: "sine.inOut" });
        },
      });
    } else {
      if (isPulse && pulseTween) { pulseTween.kill(); pulseTween = null; }
      gsap.to(el, { autoAlpha: 0, scale: 0.6, duration: 0.15, ease: "power1.out", overwrite: "auto" });
    }
  }

  function updateBar() {
    const p = clamp(acc / COMMIT_ACC, 0, 1);
    ovProgressFill.style.transform = `scaleY(${p})`;
    ovProgress.classList.toggle("on", p > 0.002);
    if (p >= 1 && !swapping) { // commit only when the bar is completely full
      acc = 0;
      ovProgress.classList.remove("on");
      ovProgressFill.style.transform = "scaleY(0)";
      swapTo(nextOf(ovDemo));
    }
  }

  function heroMask() {
    const mark = ovHeroMedia.querySelector(".ov-hero-mark");
    if (mark && !reduced()) {
      gsap.fromTo(mark, { yPercent: 115 }, { yPercent: 0, duration: 0.25, ease: "power2.out" });
    }
  }

  // One-level pixelation snap for real hero images: a 32px-block canvas copy
  // sits on top and is removed ~200ms into the reveal. Placeholder gradients
  // have nothing to pixelate — skipped.
  function pixelSnap() {
    const img = ovHeroMedia.querySelector("img");
    if (!img || !img.complete || !img.naturalWidth) return;
    const c = document.createElement("canvas");
    const w = Math.max(1, Math.round(ovHeroMedia.clientWidth / 32));
    const h = Math.max(1, Math.round(ovHeroMedia.clientHeight / 32));
    c.width = w;
    c.height = h;
    c.getContext("2d").drawImage(img, 0, 0, w, h);
    c.style.cssText = "position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;z-index:2";
    ovHeroMedia.appendChild(c);
    setTimeout(() => c.remove(), 200);
  }

  // Measured hero reveal: mask expands from center (bottom-anchored feel via
  // the +28px content drift) — 0→85% width sharp, 85→100% eased tail.
  function playHeroReveal() {
    const inner = ovHeroMedia.firstElementChild;
    const tl = gsap.timeline();
    tl.call(() => {
      gsap.set(ovHeroMedia, { autoAlpha: 1, clipPath: "inset(0% 50% 0% 50%)" });
      pixelSnap();
    }, null, 0);
    if (inner) tl.fromTo(inner, { y: 28 }, { y: 0, duration: 0.74, ease: "power2.out", clearProps: "y" }, 0);
    tl.to(ovHeroMedia, { clipPath: "inset(0% 7.5% 0% 7.5%)", duration: 0.14, ease: "power2.in" }, 0);
    tl.to(ovHeroMedia, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power2.out" }, 0.14);
    tl.call(heroMask, null, 0.14);
    tl.call(() => gsap.set(ovHeroMedia, { clearProps: "clipPath,opacity,visibility" }), null, 0.78);
  }

  function pushDemo(i) {
    history.pushState({ ov: slugOf(demos[i].name) }, "", "#work/" + slugOf(demos[i].name));
  }

  function lockPage() {
    document.documentElement.classList.add("ov-lock");
    if ("inert" in mainEl) mainEl.inert = true;
    mainEl.setAttribute("aria-hidden", "true");
  }
  function unlockPage() {
    document.documentElement.classList.remove("ov-lock");
    if ("inert" in mainEl) mainEl.inert = false;
    mainEl.removeAttribute("aria-hidden");
  }

  function showOverlayNow() {
    overlay.hidden = false;
    overlay.style.opacity = 1;
    resetOvScroll();
  }
  function finishOpen() {
    ovOpen = true;
    opening = false;
    ovClose.focus({ preventScroll: true });
  }

  // Open anatomy: exit in place → dark grid floor → masked hero reveal.
  function openOverlay(i, { push = true, animate = true } = {}) {
    if (opening) return;
    renderDemo(i);
    lockPage();

    if (reduced() || !animate) {
      showOverlayNow();
      ovOpen = true;
      ovClose.focus({ preventScroll: true });
      if (push) pushDemo(i);
      return;
    }

    opening = true;
    const tl = gsap.timeline();

    // a) EXIT — rows and preview fade in place; no slide, no transform.
    tl.to([workHead, ...rows], { autoAlpha: 0, duration: 0.25, ease: "power1.out" }, 0);
    tl.to(preview, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, 0);

    // b) FLOOR — dark bg with the faint grid; media hidden. Hash updates here.
    tl.call(() => {
      visible = false;
      currentIndex = -1;
      gsap.set(ovHeroMedia, { autoAlpha: 0 });
      showOverlayNow();
      if (push) pushDemo(i);
    }, null, 0.42);

    // c+d) HERO REVEAL after a ~200ms hold.
    tl.call(playHeroReveal, null, 0.62);
    tl.call(finishOpen, null, 1.45);
  }

  // Close: content fades in place, brief floor beat, list re-enters bright.
  function closeOverlay({ animate = true } = {}) {
    if (!ovOpen) return;
    ovOpen = false;
    hideChip();

    const finish = () => {
      overlay.hidden = true;
      unlockPage();
      // The list rows are held hidden while the overlay is open and fade back
      // in via listEnter; force the opener's row visible before focusing so the
      // focus can't silently fail on a still-hidden (visibility:hidden) element.
      if (openerEl && document.contains(openerEl)) {
        const li = openerEl.closest("li");
        if (hasGsap && li) gsap.set(li, { autoAlpha: 1 });
        openerEl.focus({ preventScroll: true });
      }
    };

    if (reduced() || !animate) {
      finish();
      listEnter(0);
      return;
    }

    gsap.to(overlay, {
      opacity: 0, duration: 0.55, ease: "power1.out",
      onComplete() {
        gsap.set(overlay, { clearProps: "opacity" });
        finish();
      },
    });
    listEnter(0.5);
  }

  // Demo swap: the next-up block rises UP and out from center; under a dark
  // blur wash the content swaps and hard-resets to the top; then the whole
  // new content sheet (hero + description + gallery) rises in from the BOTTOM
  // as one unit and settles with a clean ease-out (no bounce).
  function swapTo(i, { push = true } = {}) {
    if (swapping || i === ovDemo) return;
    if (reduced()) {
      renderDemo(i);
      resetOvScroll();
      ovClose.focus({ preventScroll: true });
      if (push) pushDemo(i);
      return;
    }
    swapping = true;
    if (pulseTween) { pulseTween.kill(); pulseTween = null; }
    // Freeze the scroller so leftover fling momentum can't carry the new demo
    // down; it re-opens at the top when the transition finishes.
    scroller.style.overflow = "hidden";
    const tl = gsap.timeline({
      onComplete() { swapping = false; scroller.style.overflow = ""; },
    });
    tl.to(ovNextSticky, { y: -140, autoAlpha: 0, duration: 0.55, ease: "power2.in" }, 0);
    tl.to(ovWash, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, 0.2);
    tl.call(() => {
      renderDemo(i);
      resetOvScroll();
      if (push) pushDemo(i);
      gsap.set(ovNextSticky, { clearProps: "transform,opacity,visibility" });
      gsap.set(ovHeroMedia, { clearProps: "transform" }); // drop leftover parallax
      pixelSnap();
      gsap.set([ovHero, ovSheet], { y: 160 }); // whole sheet staged below the fold
    }, null, 0.55);
    tl.to([ovHero, ovSheet], { y: 0, duration: 0.6, ease: "power2.out", clearProps: "transform" }, 0.6);
    tl.to(ovWash, { autoAlpha: 0, duration: 0.45, ease: "power1.inOut" }, 0.62);
    tl.to({}, { duration: 0.4 }, 0.6); // hold the timeline until the rise lands
  }

  // --- list → overlay ---
  list.addEventListener("click", (e) => {
    const item = e.target.closest("a.demo-item");
    if (!item) return;
    e.preventDefault();
    openerEl = item;
    openOverlay(+item.dataset.index);
  });

  // --- close: ×, back link, Esc — all close to the list ---
  function backToList() {
    closeOverlay();
    history.replaceState(null, "", location.pathname + location.search);
  }
  ovBack.addEventListener("click", (e) => { e.preventDefault(); backToList(); });
  ovClose.addEventListener("click", backToList);
  // The × rotates 90° on hover of the button itself (pure CSS :hover).
  document.addEventListener("keydown", (e) => {
    if (!ovOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      backToList();
      return;
    }
    if (e.key === "Tab") {
      const els = [...overlay.querySelectorAll('a[href], button, [tabindex="0"]')]
        .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden");
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // --- hero: click / Enter opens the live demo; rose pill trails the cursor ---
  function openLive() {
    const d = demos[ovDemo];
    if (d && d.url) window.open(d.url, "_blank", "noopener");
  }
  ovHero.addEventListener("click", () => {
    if (chipOn && hasGsap) {
      gsap.timeline({ overwrite: "auto" })
        .to(playChip, { scale: 0.88, duration: 0.08, ease: "power2.in" })
        .to(playChip, { scale: 1, duration: 0.12, ease: "back.out(1.7)" });
    }
    openLive();
  });
  ovHero.addEventListener("keydown", (e) => {
    if (e.key === "Enter") openLive();
  });

  // Heavy-lag follower: plain per-frame lerp. Pill sits ABOVE the cursor,
  // its bottom edge meeting the cursor tip.
  let chipOn = false;
  let chipTx = 0, chipTy = 0, chipPx = 0, chipPy = 0;
  const chipTX = (cx) => cx - playChip.offsetWidth / 2;
  const chipTY = (cy) => cy - playChip.offsetHeight;
  if (hasGsap) {
    gsap.ticker.add(() => {
      if (!chipOn) return;
      chipPx += (chipTx - chipPx) * 0.075; // heavier lag → trails longer
      chipPy += (chipTy - chipPy) * 0.075;
      gsap.set(playChip, { x: chipPx, y: chipPy });
    });
  }
  function hideChip() {
    if (!chipOn) return;
    chipOn = false;
    if (hasGsap) gsap.to(playChip, { autoAlpha: 0, scale: 0.9, duration: 0.18, overwrite: "auto" });
  }
  ovHero.addEventListener("mouseenter", (e) => {
    if (reduced() || !window.matchMedia("(hover: hover)").matches) return;
    chipOn = true;
    chipTx = chipPx = chipTX(e.clientX);
    chipTy = chipPy = chipTY(e.clientY);
    gsap.set(playChip, { x: chipPx, y: chipPy, scale: 1 });
    gsap.to(playChip, { autoAlpha: 1, duration: 0.06, overwrite: "auto" }); // materialize ≤70ms
  });
  ovHero.addEventListener("mousemove", (e) => {
    if (!chipOn) return;
    chipTx = chipTX(e.clientX);
    chipTy = chipTY(e.clientY);
  });
  ovHero.addEventListener("mouseleave", hideChip);

  // "see the demo •" scales up on hover (CSS). Its click is inert without a
  // url — guard against navigating to "#".
  ovSee.addEventListener("click", (e) => { if (!ovSee.hasAttribute("href")) e.preventDefault(); });

  // --- scroll: reveals, ×-fade, hero counter-parallax, chips-in-view ---
  const heroParallax = hasGsap ? gsap.quickSetter(ovHeroMedia, "yPercent") : null;
  let scrollQueued = false;
  scroller.addEventListener("scroll", () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      if (!ovOpen || reduced()) return;
      const top = scroller.scrollTop;
      const vh = scroller.clientHeight;
      // Settled at-end state: the accumulator may only charge once the scroller
      // has actually come to rest at the bottom.
      atEnd = top >= (scroller.scrollHeight - scroller.clientHeight) - 2;
      checkFigReveals();
      setCloseVisible(top < vh * 0.9);

      // During a swap the hero transform is owned by the rise tween — don't
      // let the counter-parallax fight it.
      if (swapping) return;
      if (heroParallax) heroParallax(-20 * clamp(top / vh, 0, 1));

      // Revealed fraction: how much of the (pinned) next-up card is uncovered
      // by the receding white sheet. Scrub + chip staging track the reveal.
      const cr = ovNextCard.getBoundingClientRect();
      const sheetBot = ovSheet.getBoundingClientRect().bottom;
      const cardH = cr.height || 1;
      const revealed = clamp((cr.bottom - sheetBot) / cardH, 0, 1);

      gsap.set(ovNextCard, { scale: 0.85 + 0.15 * revealed });

      const wantNext = revealed > 0.05;
      const wantScroll = revealed > 0.9;
      if (wantNext !== nextChipOn) { nextChipOn = wantNext; toggleChip(nextChip, wantNext, false); }
      if (wantScroll !== scrollChipOn) { scrollChipOn = wantScroll; toggleChip(scrollChip, wantScroll, true); }
    });
  }, { passive: true });

  // Overscroll accumulator: only charges on downward wheel input while the
  // scroller is already settled at its absolute end, capped per event.
  scroller.addEventListener("wheel", (e) => {
    if (!ovOpen || reduced() || swapping) return;
    if (e.deltaY <= 0) return; // scrolling up never charges
    if (!atEnd) return; // a fling that only now reaches the end doesn't charge
    acc = Math.min(COMMIT_ACC, acc + Math.min(e.deltaY * GAIN, PER_EVENT_CAP));
    lastInput = performance.now();
    updateBar();
  }, { passive: true });

  // No memory: the bar decays ~120px/s whenever input pauses.
  if (hasGsap) {
    gsap.ticker.add((time, deltaMs) => {
      if (!ovOpen || reduced() || swapping) return;
      if (acc > 0 && performance.now() - lastInput > 100) {
        acc = Math.max(0, acc - DECAY * (deltaMs / 1000));
        updateBar();
      }
    });
  }

  ovNextCard.addEventListener("click", () => swapTo(nextOf(ovDemo)));

  // --- hash / history ---
  function demoFromHash() {
    const m = location.hash.match(/^#work\/(.+)$/);
    if (!m) return -1;
    return demos.findIndex((d) => slugOf(d.name) === m[1]);
  }

  addEventListener("popstate", (e) => {
    const i = e.state && e.state.ov
      ? demos.findIndex((d) => slugOf(d.name) === e.state.ov)
      : demoFromHash();
    if (i >= 0) {
      if (ovOpen) swapTo(i, { push: false });
      else openOverlay(i, { push: false });
    } else {
      closeOverlay();
    }
  });

  // Deep-load: #work/<slug> opens that demo directly, no animation.
  const initial = demoFromHash();
  if (initial >= 0) {
    history.replaceState({ ov: slugOf(demos[initial].name) }, "", location.hash);
    openOverlay(initial, { push: false, animate: false });
  }

  mqReduce.addEventListener("change", () => {
    syncMotionClass();
    if (hasGsap) gsap.killTweensOf([preview, playChip, ...faces]);
    preview.style.opacity = 0;
    preview.style.visibility = "hidden";
    visible = false;
    currentIndex = -1;
    hideChip();
  });
})();

/* =========================================================
   Final CTA — Cal.com facade. Nothing loads until the click,
   protecting the sub-second initial load.

   Cal("init") makes the embed script bind its own delegated click
   listener to every element carrying data-cal-link, so from the
   second click onward Cal.com handles the button itself — no code
   of ours involved. But that listener isn't registered yet at the
   moment of the very first click (the one that triggers the load),
   so we open the modal explicitly, once, for that first click only.
   ========================================================= */
(function initCal() {
  const btn = document.getElementById("book-call");
  if (!btn) return;

  function loadCal() {
    if (window.Cal) return Promise.resolve();
    return new Promise((resolve) => {
      /* Cal.com official embed bootstrap */
      (function (C, A, L) {
        let p = function (a, ar) { a.q.push(ar); };
        let d = C.document;
        C.Cal = C.Cal || function () {
          let cal = C.Cal, ar = arguments;
          if (!cal.loaded) {
            cal.ns = {}; cal.q = cal.q || [];
            const s = d.createElement("script");
            s.src = A; s.onload = resolve;
            d.head.appendChild(s);
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api = function () { p(api, arguments); };
            const namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === "string") { cal.ns[namespace] = api; p(api, ar); }
            else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
      })(window, "https://app.cal.com/embed/embed.js", "init");
      window.Cal("init", { origin: "https://cal.com" });
    });
  }

  btn.addEventListener("click", function openOnFirstClick() {
    loadCal().then(() => {
      window.Cal("modal", {
        calLink: btn.dataset.calLink,
        config: JSON.parse(btn.dataset.calConfig || "{}"),
      });
    });
  }, { once: true });
})();

/* =========================================================
   Secondary path — clinic + phone + email → Apps Script.
   Phone gets a country picker + validation via intl-tel-input,
   lazy-loaded only once Section 04 nears the viewport (never on
   page load). A hidden honeypot field traps naive bots.
   ========================================================= */
(function initLeadForm() {
  const section = document.getElementById("ultimatum");
  const showFormLink = document.getElementById("show-form");
  const form = document.getElementById("lead-form");
  if (!section || !showFormLink || !form) return;

  const clinicInput = document.getElementById("clinic-input");
  const phoneInput = document.getElementById("phone-input");
  const emailInput = document.getElementById("email-input");
  const honeypot = document.getElementById("website");
  const formError = document.getElementById("form-error");

  let iti = null;
  let itiReady = null;

  function loadPhoneWidget() {
    if (itiReady) return itiReady;
    itiReady = new Promise((resolve) => {
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = `https://cdn.jsdelivr.net/npm/intl-tel-input@${ITI_VERSION}/dist/css/intlTelInput.css`;
      document.head.appendChild(cssLink);

      const script = document.createElement("script");
      script.src = `https://cdn.jsdelivr.net/npm/intl-tel-input@${ITI_VERSION}/dist/js/intlTelInput.min.js`;
      script.onload = () => {
        iti = window.intlTelInput(phoneInput, {
          initialCountry: "us",
          loadUtils: () => import(`https://cdn.jsdelivr.net/npm/intl-tel-input@${ITI_VERSION}/dist/js/utils.js`),
        });
        resolve();
      };
      document.head.appendChild(script);
    });
    return itiReady;
  }

  // "Nears the viewport" — start loading well before Section 04 is actually visible.
  const nearViewport = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadPhoneWidget();
        nearViewport.disconnect();
      }
    },
    { rootMargin: "600px 0px" }
  );
  nearViewport.observe(section);

  showFormLink.addEventListener("click", (e) => {
    e.preventDefault();
    loadPhoneWidget(); // safety net if the observer above hasn't fired yet
    form.classList.add("open");
    clinicInput.focus();
  });

  function setFieldError(input, errorId, message) {
    document.getElementById(errorId).textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validate() {
    let valid = true;

    if (clinicInput.value.trim().length < 2) {
      setFieldError(clinicInput, "clinic-error", "Enter your clinic name (2+ characters).");
      valid = false;
    } else {
      setFieldError(clinicInput, "clinic-error", "");
    }

    if (!iti || !iti.isValidNumber()) {
      setFieldError(phoneInput, "phone-error", "Enter a valid phone number.");
      valid = false;
    } else {
      setFieldError(phoneInput, "phone-error", "");
    }

    if (!emailInput.checkValidity() || !emailInput.value.trim()) {
      setFieldError(emailInput, "email-error", "Enter a valid email address.");
      valid = false;
    } else {
      setFieldError(emailInput, "email-error", "");
    }

    return valid;
  }

  function showSuccess() {
    showFormLink.closest(".secondary-row").hidden = true;
    form.querySelector(".lead-fields").hidden = true;
    form.querySelector('button[type="submit"]').hidden = true;
    form.querySelector(".form-confirm").hidden = false;
    form.reset();
    if (iti) iti.setNumber("");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.hidden = true;

    // Spam trap: real visitors never see or fill this field. Pretend success,
    // send nothing, so scripted fillers get no signal that they were caught.
    if (honeypot.value) {
      showSuccess();
      return;
    }

    await loadPhoneWidget(); // guards a submit that beats the lazy-load on a slow connection
    if (!validate()) return;

    const payload = {
      clinicName: clinicInput.value.trim(),
      phone: iti.getNumber(),
      email: emailInput.value.trim(),
    };

    try {
      // Content-Type is explicitly text/plain — one of the three MIME types
      // no-cors allows without triggering a preflight. Apps Script's doPost
      // reads the JSON via JSON.parse(e.postData.contents).
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      showSuccess();
    } catch (err) {
      formError.textContent = "Something went wrong — please try again.";
      formError.hidden = false;
    }
  });
})();

/* Demo link target (03B CTA) — opens the live Velora demo in a new tab. */
(function initDemoLink() {
  const demo = document.getElementById("demo-link");
  if (!demo) return;
  demo.href = VELORA_DEMO_URL;
  demo.target = "_blank";
  demo.rel = "noopener";
})();

/* Splendessa — "The 10 PM Client"
   Everything here is progressive enhancement: final values live in the HTML,
   the page reads correctly with JS disabled. */

"use strict";

/* ---- Nick: swap these before launch ---- */
const CONFIG = {
  calLink: "REPLACE-ME/15-min-intro-call",      // Cal.com event link
  appsScriptUrl: "REPLACE-ME-APPS-SCRIPT-URL",  // Sheets/Apps Script endpoint
};
const VELORA_DEMO_URL = "https://velora.splendessa.com";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

/* =========================================================
   Hero counters — 75 and 46 count up. The 0 is NOT here:
   it has no data attribute, no selector matches it, ever.
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
// Wait for the real font (avoids a mid-count metric swap), but never longer than 400ms.
Promise.race([
  document.fonts ? document.fonts.ready : Promise.resolve(),
  new Promise((r) => setTimeout(r, 400)),
]).then(animateCounters);

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
   Before/after slider.
   Drag: handle only, via pointer capture. touch-action:none
   lives only on the handle, so page scroll is never hijacked.
   Touch: tap anywhere on the component toggles sides.
   Keyboard: arrows / Home / End on the handle.
   ========================================================= */
(function initCompare() {
  const compare = document.querySelector(".compare");
  if (!compare) return;
  const handle = compare.querySelector(".compare-handle");
  let split = 50;
  let dragging = false;

  function setSplit(value, animate = false) {
    split = Math.min(95, Math.max(5, value));
    compare.classList.toggle("toggling", animate && !reducedMotion);
    compare.style.setProperty("--split", split + "%");
    handle.setAttribute("aria-valuenow", String(Math.round(split)));
  }

  function splitFromEvent(e) {
    const rect = compare.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * 100;
  }

  handle.addEventListener("pointerdown", (e) => {
    dragging = true;
    handle.setPointerCapture(e.pointerId);
    compare.classList.remove("toggling");
    e.preventDefault();
  });
  handle.addEventListener("pointermove", (e) => {
    if (dragging) setSplit(splitFromEvent(e));
  });
  const endDrag = () => { dragging = false; };
  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);

  handle.addEventListener("keydown", (e) => {
    const step = { ArrowLeft: -5, ArrowRight: 5 }[e.key];
    if (step) { setSplit(split + step); e.preventDefault(); }
    else if (e.key === "Home") { setSplit(5); e.preventDefault(); }
    else if (e.key === "End") { setSplit(95); e.preventDefault(); }
  });

  // Tap-to-toggle: touch only, and only a genuine tap (short, still).
  let tap = null;
  compare.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch" && e.target !== handle && !handle.contains(e.target)) {
      tap = { x: e.clientX, y: e.clientY, t: performance.now() };
    }
  });
  compare.addEventListener("pointerup", (e) => {
    if (!tap || e.pointerType !== "touch") return;
    const moved = Math.hypot(e.clientX - tap.x, e.clientY - tap.y);
    const elapsed = performance.now() - tap.t;
    tap = null;
    if (moved < 10 && elapsed < 300) setSplit(split < 50 ? 88 : 12, true);
  });

  // Caption: Drag vs Tap by input type; hybrids get whichever they actually use.
  const caption = document.querySelector(".compare-caption");
  const setCaption = (mode) => { caption.textContent = caption.dataset["caption" + (mode === "tap" ? "Tap" : "Drag")]; };
  if (window.matchMedia("(pointer: coarse)").matches) setCaption("tap");
  window.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") setCaption("tap");
    else if (e.pointerType === "mouse") setCaption("drag");
  }, { passive: true, capture: true });
})();

/* =========================================================
   Final CTA — Cal.com facade. Nothing loads until the click,
   protecting the sub-second initial load.
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

  btn.addEventListener("click", () => {
    loadCal().then(() => {
      window.Cal("modal", { calLink: CONFIG.calLink });
    });
  });
})();

/* =========================================================
   Secondary path — 2-field form → Apps Script → Telegram.
   ========================================================= */
(function initForm() {
  const link = document.getElementById("show-form");
  const form = document.getElementById("lead-form");
  if (!link || !form) return;

  link.addEventListener("click", (e) => {
    e.preventDefault();
    form.classList.add("open");
    form.querySelector("input").focus();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    // no-cors: Apps Script web-app endpoints don't return CORS headers.
    fetch(CONFIG.appsScriptUrl, { method: "POST", body: data, mode: "no-cors" })
      .catch((err) => console.warn("Lead form submit failed:", err));
    // Instant on-screen confirmation (spec).
    form.querySelector(".lead-fields").hidden = true;
    form.querySelector('button[type="submit"]').hidden = true;
    form.querySelector(".form-confirm").hidden = false;
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

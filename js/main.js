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
   03A — The Work demo list. The list is generated entirely
   from the demos config below; changing a demo only ever
   means editing its config line. "live" rows are real links
   (new tab); "soon" rows are focusable but inert — no label,
   no click. One fixed preview card is reused for every row:
   it follows the cursor via gsap.quickTo, and under reduced
   motion (or if GSAP is missing) it docks beside the item
   with no follow animation. Keyboard focus behaves like
   hover, with the card docked next to the focused row.
   ========================================================= */
(function initDemoList() {
  const list = document.getElementById("demoList");
  const preview = document.getElementById("demoPreview");
  if (!list || !preview) return;

  // status "live" → clickable, opens url in a new tab
  // status "soon" → hover/preview only, no click
  // image null    → generated placeholder; set a path to use a real image
  const demos = [
    { name: "Velora",                 status: "live", url: "[URL-VELORA]", image: null },
    { name: "Lumina",                 status: "live", url: "[URL-LUMINA]", image: null },
    { name: "Maelis",                 status: "live", url: "[URL-MAELIS]", image: null },
    { name: "Dawn",                   status: "soon", url: null, image: null },
    { name: "Muse",                   status: "soon", url: null, image: null },
    { name: "Ember",                  status: "soon", url: null, image: null },
    { name: "Golden Hour",            status: "soon", url: null, image: null },
    { name: "Bare Beauty",            status: "soon", url: null, image: null },
    { name: "Where Time Softens",     status: "soon", url: null, image: null },
    { name: "The Face You Wake With", status: "soon", url: null, image: null },
  ];

  const faces = preview.querySelectorAll(".face");
  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hasGsap = typeof window.gsap !== "undefined";
  const reduced = () => mqReduce.matches || !hasGsap;

  demos.forEach((demo, i) => {
    const li = document.createElement("li");
    let el;
    if (demo.status === "live" && demo.url) {
      el = document.createElement("a");
      el.href = demo.url;
      el.target = "_blank";
      el.rel = "noopener";
    } else {
      el = document.createElement("span");
      el.tabIndex = 0;
    }
    el.className = "demo-item";
    el.textContent = demo.name;
    el.dataset.index = i;
    li.appendChild(el);
    list.appendChild(li);
  });

  // Placeholder: deterministic gradient per index (site palette only, with a
  // whisper of rose), demo name small in the corner.
  function buildContent(i) {
    const demo = demos[i];
    if (demo.image) {
      const img = document.createElement("img");
      img.src = demo.image;
      img.alt = "";
      return img;
    }
    const ph = document.createElement("div");
    ph.className = "demo-ph";
    const angle = 115 + (i * 37) % 90;
    const rosePct = [0, 4, 8, 6][i % 4];
    const end = `color-mix(in srgb, var(--grey-2) ${100 - rosePct}%, var(--rose) ${rosePct}%)`;
    ph.style.background = `linear-gradient(${angle}deg, var(--white) 0%, ${end} 100%)`;
    const label = document.createElement("span");
    label.className = "demo-ph-label";
    label.textContent = demo.name;
    ph.appendChild(label);
    return ph;
  }

  let quickX, quickY;
  if (hasGsap) {
    quickX = gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3" });
    quickY = gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3" });
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
    next.replaceChildren(buildContent(i));
    front = 1 - front;

    if (reduced()) {
      next.style.opacity = 1;
      prev.style.opacity = 0;
      snapTo(itemTarget(item));
      preview.style.opacity = 1;
      preview.style.visibility = "visible";
      if (hasGsap) gsap.set(preview, { scale: 1 });
      return;
    }

    if (!wasVisible) {
      gsap.set(next, { opacity: 1 });
      gsap.set(prev, { opacity: 0 });
      snapTo(docked ? itemTarget(item) : cursorTarget());
      gsap.set(preview, { scale: 0.9 });
      gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power2.out", overwrite: "auto" });
    } else {
      gsap.set(next, { opacity: 0 });
      gsap.to(next, { opacity: 1, duration: 0.25, ease: "power1.out", overwrite: "auto" });
      gsap.to(prev, { opacity: 0, duration: 0.25, ease: "power1.out", overwrite: "auto" });
      gsap.fromTo(preview, { scale: 0.97 }, { scale: 1, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      if (docked) snapTo(itemTarget(item));
    }
  }

  function hide() {
    if (!visible) return;
    visible = false;
    currentIndex = -1;
    if (reduced()) {
      preview.style.opacity = 0;
      preview.style.visibility = "hidden";
    } else {
      gsap.to(preview, { autoAlpha: 0, scale: 0.92, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    }
  }

  list.addEventListener("mouseover", (e) => {
    const item = e.target.closest(".demo-item");
    if (!item) return;
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

  list.addEventListener("mouseleave", hide);

  list.addEventListener("focusin", (e) => {
    const item = e.target.closest(".demo-item");
    if (!item || !item.matches(":focus-visible")) return;
    showFor(item, true);
  });

  list.addEventListener("focusout", (e) => {
    if (!list.contains(e.relatedTarget)) hide();
  });

  // Reset cleanly if the motion preference flips mid-session.
  mqReduce.addEventListener("change", () => {
    if (hasGsap) gsap.killTweensOf([preview, ...faces]);
    preview.style.opacity = 0;
    preview.style.visibility = "hidden";
    visible = false;
    currentIndex = -1;
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

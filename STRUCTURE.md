# STRUCTURE.md — Splendessa Landing (v2)

*Locked page structure. Section order = order below. Content, copy, and design details of each section are decided in separate sessions — this file defines ONLY which sections exist, in what order, and what role each plays. Do not add, remove, or reorder sections without an explicit request.*

---

## 01 — Hero (v10, "10:04 PM, twice")

- **Role:** opens with the story — cinematic auto-play hero in 3 scenes (lost DM → the same minute replayed with an instant confirmed booking → classic hero with H1, stat, CTA).
- **Fixed notes:** static fallback (scene 3) for no-JS / reduced-motion. The fake status bar does NOT exist on mobile.
- **Details:** decided in the dedicated hero session.

## 02 — Diagnosis (mini-section, the numbers)

- **Role:** the consequence in numbers — the statistics that validate the problem acted out in the hero.
- **Note:** short transitional section, not a large block.
- **Details:** separate session.

## 03 — The Work (demo list)

- **Role:** visual proof — typographic list in the style of pacomepertant.com with 10 premium demos.
- **Fixed notes:** clean default state (typography, no visible images); reveal on interaction. Mobile behavior decided separately.
- **Details (demo names, categories, exact interaction):** separate session.

## 04 — The 10 PM Standard (mini-section, the offer)

- **Role:** names the offer and breaks it into benefits — the bridge between "what I just saw" (the list) and "what I do now" (CTA).
- **Note:** compact and aesthetic, not a long block.
- **Details:** separate session.

## 05 — CTA (Ultimatum)

- **Role:** conversion — Cal.com booking (splendessa/15-min-intro-call) + lead form as the alternative path.
- **Fixed notes:** primary CTA in rose; Apps Script → Sheets/Telegram stays wired.
- **Details (button animation, adjacent elements):** separate session.

## 06 — Footer

- **Role:** page close — legal (Terms, Privacy), social links, identity.
- **Details:** separate session.

---

## Flow

Hero v10 (story + stat + CTA) → Diagnosis (numbers) → The Work (demo list) → The 10 PM Standard (offer) → CTA (booking/lead) → Footer.

## Global effects (site-wide, decided in a separate session)

- Clock that advances with scroll (night → morning, tied to the dark→light transition)
- Background grid with interaction (spotlight or a variant — TBD)
- Magnetic + animated CTA button
- Text reveal on scroll (optional)

## General rules

- Design DNA: follow DESIGN.md (typography and rose usage get updated there — not ad-hoc per section).
- Performance is a sales argument — any effect that slows the page gets cut.
- One conversion path: the final rose CTA. External links (demos) open in a new tab.
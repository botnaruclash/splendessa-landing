CLAUDE.md — Splendessa Landing Page ("The 10 PM Client")

Project

Single-page marketing site for splendessa.com. Static, no backend except Cal.com embed and one 2-field form (Sheets/Apps Script). The full spec lives in splendessa-landing-v3-FINAL.md in this repo — it is the source of truth for all copy and structure. Copy is LOCKED: never rewrite, "improve", or extend any text from the spec.

⚠️ Skill override

This project deliberately DEVIATES from the splendessa-dna skill:


NO Cormorant Garamond. NO serif anywhere. Inter only.
NO cream/ivory/champagne/gold palette.
If splendessa-dna suggests otherwise, this file wins.


Design system (strict)


Palette: #FFFFFF, #17161A, max two greys. Rose #B5536D appears in EXACTLY three places: logo, right phone glow (Section 02), final CTA button. Nowhere else — no rose hovers, links, focus rings, or accents.
Intermediate CTAs: hero = white ghost/outline; demo CTA = charcoal outline. Only the final CTA is rose.
Typography: Inter only. Hero H1 clamp(56px, 9vw, 110px), H2 40–56px, body 16–18px, captions 12–13px muted. Hierarchy via weight (300/500/700), never via color.
Layout: one idea per viewport. Generous whitespace. No cards, borders, shadows (except subtle phone-mockup depth). No icons anywhere.
Motion: max one orchestrated moment per section. Scroll reveals = fade + 12–16px rise only. prefers-reduced-motion fully respected (final states shown, no animation).


Non-negotiable build rules


Mobile first-viewport: H1 visible without scrolling on 390px; counters collapse to one horizontal row.
Hero counters: 75% and 46% count up; the 0 NEVER animates — instant render, one weight heavier.
Dark→light: page is charcoal until the "07:42 — you wake up." viewport, then fades to white.
Before/after: vertical divider bar, drag captured on handle ONLY (never hijack scroll); touch adds tap-to-toggle; caption swaps Drag/Tap by input type.
The Velora "after" image is the same asset dissected in 03B.
"Laser Hair Removal" — identical naming in DM mockup, confirmation mockup, and any demo references.
Page must load sub-second (it claims to). Target Lighthouse Performance ≥ 95. No heavy libraries; vanilla or minimal deps.
NEVER run git commands. Commits are manual, done by Nick.


Workflow


One change per prompt. Touch only the element named in the prompt.
After visual changes, screenshot and self-check against this file before reporting done.
QA checklist before calling any section complete: reduced-motion works · keyboard focus visible · 390px + 768px + 1440px checked · no rose outside the three allowed places · copy matches spec verbatim.
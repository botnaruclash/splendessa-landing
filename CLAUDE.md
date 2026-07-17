CLAUDE.md — Splendessa Landing Page

Project: single-page marketing site, splendessa.com. Static, no backend except 
Cal.com embed + one 2-field lead form (Apps Script → Sheets/Telegram). Full 
narrative/creative brief: splendessa-landing-v4-DESIGN-OPEN.md in this repo.

Status: full visual redesign pass in progress. v3's design system is retired 
on purpose — don't default back to it from habit or from reading old commits.

🔒 Locked (still true)
- Palette: #FFFFFF, #17161A, max two greys, rose #B5536D as the one accent — 
  brand color used across live social assets, don't swap the hex. 
  Frequency/placement is open.
- Functionality: Cal.com booking embed and the Apps Script lead-capture form 
  must keep working — same trigger points, field names, endpoints. Test both 
  after any structural change.
- Accessibility floor, non-negotiable regardless of aesthetic: 
  prefers-reduced-motion respected, visible keyboard focus, real contrast — 
  don't sacrifice these for effect.

🎨 Open (retired from v3 — don't reapply without being asked)
- Typography — was Inter-only, now unrestricted.
- Layout — was Apple-minimal/one-idea-per-viewport/no-cards, now unrestricted.
- Motion — was max one moment per section, now unrestricted; gsap skills 
  should be used where available.
- Section count/order — was fixed to v3 outline, now open to merge/cut/reorder.
- Copy — was locked verbatim, now source material: keep the core narrative 
  (see brief), rewrite/cut/restructure the actual sentences freely.

Workflow
- This redesign pass: present a design plan (token system + layout concept + 
  signature element) before writing code. Get explicit approval, then build.
- After the initial pass: back to one-change-per-prompt discipline, touching 
  only the named element.
- After any structural change, verify Cal.com and the lead form still fire 
  correctly — screenshot + manual test, not assumed.
- QA before calling a section done: reduced-motion works · keyboard focus 
  visible · 390px/768px/1440px checked · rose used deliberately, not scattered.
- NEVER run git commands. Commits are manual, done by Nick.

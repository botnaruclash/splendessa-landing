SPLENDESSA LANDING PAGE — BLUEPRINT v3 (FINAL · BUILD)

Monochrome premium. English only. This document is the complete spec — paste it whole into the first Claude Code prompt.

⚠️ SKILL OVERRIDE (put this line in the Claude Code prompt): "This page deliberately deviates from the splendessa-dna skill: NO Cormorant Garamond, no serif anywhere. Inter only. Palette rules below override the skill's palette."


DESIGN SYSTEM

Palette (strict):


White #FFFFFF · Charcoal #17161A · two greys max for muted text/captions.
Rose #B5536D appears in EXACTLY three places: (1) logo, (2) right phone glow in Section 02, (3) final CTA button. Nowhere else — no rose hovers, links, underlines, or accents. On an otherwise monochrome page, the rose CTA is the loudest element by default.


Typography: Inter only. Dramatic scale: hero H1 ~clamp(56px, 9vw, 110px), tight tracking on display sizes, section H2 ~40-56px, body 16-18px, captions/sources 12-13px muted. Weight does hierarchy work (300/500/700), not color.

Layout (Apple-minimal): one idea per viewport. Generous macro whitespace between sections; content column max ~1100px, hero text can go wider. No cards, no borders, no shadows except the phone mockups' subtle depth. No icons anywhere — text and numbers only.

Motion: one orchestrated moment per section, subtle scroll-reveals (fade + 12-16px rise), the dark→light background transition at 07:42, counter animation in hero. Nothing else. prefers-reduced-motion respected: all animation off, final states shown.

Logo: black/white version on light sections; existing rose logo allowed as the rose instance.


[ 01 / THE HOOK ] — charcoal. Tiny "22:14" floating near hero.

Counters, small source line under each (muted grey):


75% — judge a business's credibility by its website design alone.
Stanford Web Credibility Research




46% — of bookings happen when the doors are closed.
Phorest — 5,000+ salons & spas analyzed




0 — will DM and wait until morning.
Source: your inbox.



SPEC: 75% and 46% count up on load. The 0 never animates — renders instantly at full opacity, one weight heavier than the others. Deliberate, not broken.
MOBILE: counters in one compact horizontal row; H1 must sit inside the first viewport.

H1:


She searched at 10 PM.
She booked at 10:26.
Not with you.



Sub:


Premium clients don't wait for opening hours.
You have 26 minutes — or you're funding your competitor's clinic.



CTA (ghost/outline white — NOT rose): See the 10 PM Standard ↓


[ 02 / THE DIAGNOSIS ] — dark. Two phones. Right phone = the only light source on the page's dark half, rose glow.

Left phone (grey, dim): realistic Instagram DM UI — "Hi! How much is laser hair removal?" — receipt shown relatively: "Seen 13h ago". Caption carries absolute times.

Caption:


"DM for info."
Sent 22:15. Seen 11:20 — the next day.
She'd booked elsewhere by 22:26.



Micro:


No record. No alert. She never existed.



Right phone (glowing): Velora · Laser Hair Removal · Tomorrow, 2:00 PM · Booking confirmed ✓ · 22:26

Caption:


Booked at 22:26. Confirmed instantly.
You woke up to a filled chair.



CONSISTENCY: "laser hair removal" identical across DM → confirmation → Velora demo menu.


[ TRANSITION ] — full viewport, one line, nothing else


07:42 — you wake up.



Charcoal fades to white on scroll past this line.


[ 03A / THE DIFFERENCE ] — white

H2:


Same clinic. Same prices.
Different first impression.



Element: before/after comparison — one image split by a vertical bar the visitor drags left/right.
SPEC: drag captured on the handle only, never hijacks page scroll; touch devices additionally get tap-to-toggle. Caption adapts: desktop "Drag. That's the entire pitch." / touch "Tap. That's the entire pitch."
"Before" composite: dated via typography and stock-photo tells (system fonts, cramped tiled layout) — not a phone number in the header. Plausibly ugly, never cartoonish. B&W-treat the "before" slightly desaturated so the "after" (Velora, in its own cream/gold palette) reads as the only colored artifact in daylight — color arrives with quality.


[ 03B / THE STANDARD ] — white. The Velora visual from the slider locks in place, receives callouts.

H2:


The 10 PM Standard.



Sub:


Velora — a clinic that doesn't exist, running the system yours should.



Callouts (numbered in charcoal, no icons):


① Looks like the prices.
Design that lets you charge what you're worth.




② Books while you sleep.
Live calendar, instant confirmation. No DMs.




③ Engineered for search.
Sub-second load. Local search built into the code.



CTA (charcoal outline — NOT rose): Explore the live demo →

VELORA GATE TASKS (Sandu & Luca — launch blockers):


Persistent return banner on demo: "Get this for your clinic →" → back to this page's final CTA.
Booking calendar + instant-confirmation flow visible within ~10s of landing.
Demo menu lists "Laser Hair Removal", naming matched to Section 02.



[ 04 / THE ULTIMATUM ] — back to charcoal.

The floor (one small grey line):


Hosting · Analytics · SEO · Security · Sub-second speed — quietly handled.



H2:


Be there at 10 PM.



Sub:


Or keep reading DMs at 11 AM.



PRIMARY CTA — the rose button, the only one on the page: Secure the 10 PM client →
→ opens embedded Cal.com booking (15-min call, live calendar, instant confirmation). Doctor experiences at 22:00 exactly what the page sells. Cal.com → Google Calendar + Telegram notification.

SECONDARY (small text link): Prefer to write? Leave your details →
→ 2-field form (clinic name + phone/WhatsApp) → Sheets + Apps Script → Telegram. Instant on-screen confirmation on submit.

Micro (under secondary):


We reply faster than a DM.




PAGE ARC

22:14 charcoal → the split (rose glow = first color) → 07:42 flip to white → Velora brings color back through the slider → charcoal bookend → the rose button. Color on this page means one thing: the moment a client is won.

PRE-BUILD CHECKLIST (Nick)


Cal.com account created, event type "15-min intro call", link ready before build.
Velora gate tasks sent to Sandu & Luca.
Composite "before" site — needed only for 03A; page can be built with a placeholder.


CHANGELOG vs v2


English everywhere, including mockups; Romanian voice rule deleted.
Full monochrome; rose restricted to logo / right phone glow / final CTA. All other CTAs ghost or charcoal outline.
Frozen-0: heavier weight instead of rose.
Full sans-serif (Inter); explicit splendessa-dna override required in the build prompt.
Before/after confirmed as interactive vertical-bar drag + tap-toggle.
Apple-minimal design system specified: type scale, whitespace, motion budget, no icons, reduced-motion support.
"Before" slightly desaturated so color = quality across the whole page.
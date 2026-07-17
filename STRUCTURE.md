# STRUCTURE.md — Inventar secțiuni index.html

*Analiză, nu spec. Ordinea = ordinea din pagină. Fiecare secțiune are `data-zone` dark/light — pagina alternează charcoal → alb → charcoal.*

---

## Header (`.site-head`)
- **Rol:** branding minim, ancoră spre top.
- **Conține:** wordmark text (link spre #hook). Fără nav, fără CTA.

## 01 — Hook (`#hook`, dark)
- **Rol:** captează atenția cu problema — clientul pierdut noaptea, formulat personal ("not with you").
- **Conține:** H1 pe trei rânduri (singurul element vizual), CTA ghost.
- **CTA:** ghost → scroll la #standard ("See the 10 PM Standard ↓").

## Proof Strip (`#proof-strip`, dark)
- **Rol:** validează problema cu cifre — dovadă statistică imediat după hook.
- **Conține:** 3 countere cu sursă citată; primele două animate, al treilea ("0") intenționat static și mai greu vizual — e poanta.
- **CTA:** niciunul.

## 02 — Diagnosis (`#diagnosis`, dark)
- **Rol:** agită problema vizual — dramatizează scenariul din hero prin comparație directă.
- **Conține:** două mockup-uri de telefon side-by-side: DM ignorat (stânga) vs. booking confirmat instant pe Velora (dreapta, cu glow rose), fiecare cu caption narativ.
- **CTA:** niciunul.

## Transition (`.flip`, dark, fără id)
- **Rol:** pauză dramatică — un singur rând pe viewport întreg, puntea între noapte (problemă) și dimineață (soluție).
- **Conține:** o linie de text. Atât.
- **CTA:** niciunul.

## 03A — Difference (`#difference`, light)
- **Rol:** demonstrează soluția interactiv — "vezi diferența cu mâna ta".
- **Conține:** H2, slider before/after (accesibil, cu handle keyboard), caption care se adaptează touch/mouse.
- **CTA:** niciunul explicit — sliderul E pitch-ul.

## 03B — Standard (`#standard`, light)
- **Rol:** explică ce e produsul — numește oferta ("The 10 PM Standard") și o desface în beneficii.
- **Conține:** H2, subtitlu, screenshot Velora (același asset ca "after"-ul din slider), 3 callout-uri numerotate (design/booking/SEO), CTA outline.
- **CTA:** outline → demo live extern (velora.splendessa.com, tab nou).

## 04 — Ultimatum (`#ultimatum`, dark)
- **Rol:** închide — reia promisiunea din titlu, forțează alegerea, împinge spre booking.
- **Conține:** linie "quietly handled" (obiecții tehnice rezolvate în treacăt), H2 + subtitlu, CTA principal rose, link secundar care dezvăluie formularul, formular lead 3 câmpuri (clinic/telefon/email) + honeypot, micro-line de încheiere.
- **CTA principal:** buton rose → Cal.com embed (splendessa/15-min-intro-call). Singurul CTA rose de pe pagină.
- **CTA secundar:** link → deschide #lead-form (Apps Script → Sheets/Telegram).

---

## Flux

Hook (problemă, personal) → Proof Strip (cifre care o confirmă) → Diagnosis (agitare vizuală: DM pierdut vs. booking instant) → Transition (respiro: se face dimineață) → Difference (demo interactiv before/after) → Standard (ce primești, 3 beneficii + demo live) → Ultimatum (alegerea + booking Cal.com / formular).

**Observații pentru discuție:**
- Un singur drum de conversie, la final — nu există CTA de booking înainte de #ultimatum; hero-ul împinge doar în jos.
- Rose apare exact de 3 ori, toate cu sens: logo, glow-ul telefonului Velora, butonul final.
- Secțiunile "de dovadă" (Proof Strip, Diagnosis) vin *înainte* de soluție — structura e problem-agitate-solve clasică, cu proof mutat în faza de agitare, nu după soluție. Nu există testimoniale/social proof clasic.

# TASTE — the half no script can score

> `audit.mjs` copies this file to `{{OUT}}/TASTE.md` on every run. **Automated result this run: {{AUDIT}}.** That number says nothing is *broken*.
> It does not say the work is *good*. Ship on the **total below**, not on the 80.

**How to fill it in (10 minutes, no skipping):**
1. Open `{{OUT}}/contact-desktop.png`, `{{OUT}}/contact-mobile.png`, `{{OUT}}/contact-landscape.png`, `{{OUT}}/fallback-nowebgl.png`.
2. Score every row **0–10**. Be harsh: 5 = "fine, a default", 7 = "someone made choices", 9 = "I would screenshot it", 10 = "I would send it to a friend".
3. Write ONE sentence of **evidence** per row naming a frame (e.g. "p=0.58 desktop: hero is a flat blue ball, no rim"). A score with no evidence is a 0.
4. Anything under 7 → fix it, re-run the audit, re-score. Maximum three loops; after that, ship the honest number.

| # | Question | Anchors (what 3 / 7 / 10 look like) | /10 | Evidence (frame + sentence) |
|---|---|---|---|---|
| 1 | **Hero.** Would you screenshot it? Is it unlike a default primitive? | 3 = sphere/torus/tetrahedron with a PBR material · 7 = sculpted form, one authored detail · 10 = a silhouette people could name | | |
| 2 | **Poster frame.** Is there a mid-scroll frame you could print? | 3 = every frame is "object centred on black" · 7 = one strong composition · 10 = three | | |
| 3 | **Chapters change the picture.** Does each chapter change colour, light and composition — not just the text and the camera distance? | 3 = same blue in all five · 7 = two moods · 10 = each chapter has its own dominant hue and light, one accent (`mood.ts`) | | |
| 4 | **Type and world.** Does the world touch the type (depth, occlusion, light, reflection)? | 3 = text floats on top · 7 = type has a plate/shadow it earns · 10 = the hero passes in front of / behind the letters | | |
| 5 | **Palette discipline.** One dominant hue + one accent per chapter? | 3 = rainbow or one flat colour · 7 = disciplined but safe · 10 = a palette you could name | | |
| 6 | **Not the last world.** Does it look like the previous thing you shipped? (fingerprint: {{FINGERPRINT}}) | 3 = swap the hero and it is the same site · 7 = different ground and key colour · 10 = different *look* (`looks.ts`) | | |
| 7 | **Pacing.** Crescendo, hold, release — felt, not just linted? | 3 = constant speed · 7 = one hold · 10 = silence before the peak, a release after | | |
| 8 | **Phone.** Re-composed edit, or desktop shrunk? (`contact-mobile.png`) | 3 = same shot order, tiny type · 7 = subject high, copy readable · 10 = a different, better edit than desktop | | |
| 9 | **Final frame.** Poster-grade, exactly one obvious action? | 3 = empty or two CTAs · 7 = one CTA on a composed frame · 10 = the frame you would end a trailer on | | |
| 10 | **Authorship.** Could this ship on another brand unchanged? (it must not) | 3 = yes · 7 = copy and colour are specific · 10 = the idea is the brand | | |

**Total (sum of the 10 rows × 1):** `____ / 100`  ·  **ship at ≥ 85** · below 70 redo the hero before anything else · 70–84 fix the lowest row, re-run once.

**Lowest two rows → the next two edits:**
1. 
2. 

**Honesty line** (paste into your final message): `automated {{AUDIT}} · taste ___/100 · lowest rows: __ and __`

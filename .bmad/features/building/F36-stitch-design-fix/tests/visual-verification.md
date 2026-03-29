# Visual Verification Test Spec

## Stitch Design Rules (8 regler)

Varje skärm verifieras mot dessa 8 regler. ALLA måste PASS.

### 1. Glassmorphic Floating Nav
- **PASS:** Pill-formad dock synlig i botten, avrundat (48px+), inga skarpa kanter, subtil skugga, inget solid border
- **FAIL:** Standard tab bar, skarpa hörn, synlig border-top, inte floating

### 2. Typografi
- **PASS:** Headings i serif (Noto Serif) — tjockare, elegant. Body i sans-serif (Manrope) — clean, läsbar
- **FAIL:** Allt i samma font, system-font, eller sans-serif headings

### 3. No-Line Rule
- **PASS:** Noll synliga 1px horisontella/vertikala separatorlinjer. Separation sker via spacing och tonal shift
- **FAIL:** Synliga hairline-borders, dividers, eller separator-linjer

### 4. Copper-Gold Gradients
- **PASS:** Primära CTAs har gradient från #894d0d till #a76526. Copper-ton synlig i active states, accents
- **FAIL:** Flat färger på CTAs, blå/grå/grön accents, generisk knapp-styling

### 5. Tonal Layering
- **PASS:** Minst 3 distinkta surface-nivåer synliga (t.ex. surfaceContainer bakgrund, surfaceContainerLowest kort, surface headers). Mjuka övergångar
- **FAIL:** Allt samma bakgrundsfärg, inga tonal shifts, rent vitt (#fff) överallt

### 6. Ghost Borders
- **PASS:** Där borders används: rgba(216, 195, 180, 0.20) — knappt synliga, subtila
- **FAIL:** Solid opaque borders, svarta/grå borders, synliga 1px linjer

### 7. Ultra-Diffused Shadows
- **PASS:** Skuggor knappt synliga, mjukt diffuserade, charcoal-baserade, max 0.06 opacity
- **FAIL:** Tydliga drop shadows, svarta skuggor, "floating card"-effekt

### 8. Editorial Empty States
- **PASS:** Serif heading, warm tonal bakgrund, copper gradient CTA-knapp, ingen generisk emoji
- **FAIL:** Unicode emoji + system-font text, vit bakgrund, generisk "Inga X"-meddelande

## Verifieringsprocess

### Prerequisite
1. Backend MÅSTE köra (docker compose up)
2. Seed data MÅSTE vara laddad (npx prisma db seed)
3. Verifiera via API att data finns (health endpoint, spot-check queries)

### Per skärm
1. Navigera till skärmen i appen
2. Vänta tills data laddats (INTE acceptera loading spinner som resultat)
3. Ta screenshot
4. Gå igenom alla 8 regler och dokumentera:
   - Regel → Vad syns på skärmen → PASS/FAIL
5. Om FAIL → åtgärda och ta ny screenshot

### Vad är INTE giltigt
- Screenshot av loading spinner → FAIL (inte valid testresultat)
- Screenshot av empty state när data borde finnas → FAIL
- "Koden innehåller rätt värden" utan synligt bevis → FAIL
- Jämförelse mot "det kompilerar utan fel" → FAIL

### Vad ÄR giltigt
- Screenshot med synligt innehåll (profiler, posts, meddelanden, moduler)
- Visuell bekräftelse att design-regeln syns renderad på skärmen
- Specifik beskrivning: "Ser serif-font på 'Flöde'-headingen, Manrope på post-body"

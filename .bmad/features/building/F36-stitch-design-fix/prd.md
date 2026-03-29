# F36 — Stitch Design Fix & Visual Verification: PRD

## 1. Problemformulering

F05-stitch-design lade in designtokens, typografi, floating dock och komponent-styling i kodbasen — men **ingen visuell verifiering gjordes med riktig data**. Alla screenshots visade vita sidor med copper-spinners och "Inga inlägg"-text. Verifieringsrapporten angav "7/7 PASS" falskt.

**Grundorsaker:**
1. Ingen backend kördes → inga API-svar → alla skärmar visade loading/empty states
2. Ingen seed data laddades → även med backend hade det varit tomt
3. Verifiering gjordes mot "kompilerar koden" istället för "ser det ut som designen"
4. Empty states är generiska (emoji + text) — inte editorial

## 2. Mål

Varje skärm i appen ska rendera stitch-designen med **synligt innehåll** — profiler med foton, inlägg, konversationer, moduler. Verifieringen ska vara ärlig med jämförelse-screenshots mot stitch-specen.

## 3. Framgångskriterier

| Kriterie | Mätning |
|----------|---------|
| Backend + seed data körs | API health OK, 20 profiler med foton queryable |
| Feed-skärmen visar inlägg | Screenshot med minst 3 synliga PostCards med stitch-styling |
| Discover visar profilkort | Screenshot med fullskärms SwipeCard, foto, namn, gradient |
| Chat visar konversationer | Screenshot med konversationslista, avatarer, senaste meddelande |
| Explore visar kort | Screenshot med tonal layering-kort, kategorier |
| Learn visar moduler | Screenshot med modullista, badges |
| Profile visar full profil | Screenshot med foto, bio, tags, stitch-styling |
| Empty states editorial | Serif-rubrik, varm ton, copper CTA — inte generisk emoji+text |
| Per-skärm 8-reglers checklist | Alla 8 stitch-regler PASS per skärm med data synlig |

## 4. Stitch-designregler (verifieras per skärm)

1. **Glassmorphic floating nav** — pill-dock, backdrop blur, inga borders
2. **Typografi** — Noto Serif headlines, Manrope body
3. **No-line rule** — noll synliga 1px borders
4. **Copper-gold gradients** — primary #894d0d → #a76526
5. **Tonal layering** — min 3 surface-nivåer synliga
6. **Ghost borders** — rgba(216, 195, 180, 0.20) där borders behövs
7. **Ultra-diffused shadows** — max 0.06 opacity, charcoal #2C2421
8. **Editorial empty states** — serif, varm ton, copper CTAs

## 5. Scope

### Inkluderat
- Backend + PostgreSQL + seed data setup
- Mock-konversationer och mock-meddelanden (saknas i seed)
- Visuell fix av alla 5 huvudskärmar (Feed, Discover, Chat, Explore/Learn, Profile)
- Redesign av alla empty states till editorial stil
- Per-skärm jämförelse-verifiering med data
- Release APK med fullständig regression

### Exkluderat
- Nya features/funktionalitet
- Web-appen (Next.js)
- Backend-logik/API-ändringar (utöver seed data)
- Dark mode

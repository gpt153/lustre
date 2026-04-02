# Rapport: Stitch Code-First Workflow — Uppdateringar 2026-03-29

## Bakgrund

F37 (Polaroid Mobile) och F38 (Polaroid Web) byggdes utan en enda screenshot trots explicita BLOCKING-regler i roadmaps och test-specs. Koden markerades DONE via "CODE REVIEW PASS" — ett substitut som aldrig var tillåtet. Detta hände för att reglerna var rådgivande prosa utan strukturell enforcement, och agenten kunde använda eget omdöme för att hoppa över visuell verifiering.

Samtidigt identifierades ett annat problem: Stitch genererar fullständig, implementerbar HTML/CSS med exakta proportioner, färger och typografi — men den koden användes aldrig. Epics byggdes "from scratch" istället för att konvertera Stitch-output. Halva värdet av Stitch gick förlorat.

Dessa uppdateringar löser båda problemen.

---

## Nya kommandon

### `/planera-ui` (NY)

**Fil:** `~/.claude/commands/planera-ui.md`

Ersätter `/planera` för UI/UX-features. Skillnaden:

1. **Stitch HTML laddas ner INNAN planering börjar** — inte efter, inte under
2. **Alla skärmar analyseras** — tokens, komponenter, layout, typografi extraheras
3. **Skärmar mappas till app-arkitektur** — vilken HTML-fil blir vilken komponent/sida
4. **Epics formuleras som konverteringar:** "Konvertera desktop-feed.html till CSS Modules" — INTE "Bygg feed med Polaroid-kort"
5. **Design tokens kommer från Stitch** — planeraren uppfinner inga egna värden
6. **Roadmap refererar Stitch-filer per wave** — "Stitch source: html/desktop-match.html"
7. **Post-plan verifiering** — 8-punkts checklist att roadmap faktiskt refererar Stitch

**Steg:**

```
0. Identifiera Stitch-projekt (ID krävs)
1. Ladda ner ALL HTML + alla bilder (BLOCKING)
2. Analysera Stitch HTML → stitch-analysis.md
3. Mappa skärmar → target-filer
4. Spawna bmad-planner med Stitch-kontext
5. Verifiera att roadmap refererar Stitch-filer
```

### `/bygg-ui` (NY)

**Fil:** `~/.claude/commands/bygg-ui.md`

Ersätter `/bygg` för UI/UX-features. Identisk med `/bygg` UTOM:

| Aspekt | /bygg | /bygg-ui |
|---|---|---|
| Visuell verifiering | Bara om "UI feature" | **Varje wave, utan undantag** |
| Agent-omdöme | Agenten bedömer om V-steg gäller | **Inget val — alltid** |
| Gate script | Rådgivande | **Måste exit 0 (blockerar)** |
| Screenshots | Krävs för UI-waves | **Krävs för ALLA waves** |
| COMPARISON.md | Krävs för UI-waves | **Krävs för ALLA waves** |
| Pre-commit re-check | Föreslaget | **Obligatoriskt — blockerar commit** |
| Stitch HTML till epic-builders | Ej specificerat | **Obligatoriskt — ingår i agent-prompten** |
| Fix-loop gräns | Max 3, sen PARTIALLY_APPROVED | **Ingen gräns — loopa till 100% PASS** |
| PARTIALLY_APPROVED | Tillåtet | **Existerar inte** |
| Ge upp | Efter 3 misslyckade runs | **Aldrig — fråga user efter 5 same-rule fails** |

**Stitch-integration i B2:** Epic-subagenter får explicit instruktion:

```
"Read this Stitch-generated HTML file as your implementation starting point:
 <feature-dir>/screenshots/stitch-reference/html/<file>.html
 Your task is to CONVERT this HTML to [CSS Modules / Tamagui]."
```

---

## Uppdaterade befintliga filer

### `~/.claude/commands/bygg.md`

- B3b omskriven med stor ASCII-varningsbox
- Explicita sub-steg B3b.1–B3b.6 med exakta kommandon
- B7 kräver gate script re-run som pre-commit check
- B8 kräver screenshot-sökvägar och gate-resultat i roadmap

### `~/lustre/POLAROID_DESIGN_SYSTEM.md`

- CSS padding fixat från `6.07%/21.96%` (fel, beräknat på höjd) till `7.39%/26.70%` (korrekt, beräknat på bredd)
- CSS padding-% är ALLTID relativt till elementets BREDD — inte höjd

### `~/lustre/CLAUDE.md`

- Ny sektion "Visual Testing — Screenshots & Stitch Comparison"
- Dokumenterar max 800px/200KB, resize-script, Stitch-jämförelsekrav

### Feedback-minne

`~/.claude/projects/-home-samuel/memory/feedback_visual_verification.md`

Dokumenterar alla tre incidenter och de 8 reglerna:

1. F05 — screenshots visade vita spinners, godkändes ändå
2. F37 — alla 4 waves markerade DONE med "CODE REVIEW PASS", noll screenshots, 18-minuters build
3. F38 — samma, 9-minuters build, flyttad till done/

---

## Nya filer

### `~/lustre/VISUAL_VERIFICATION_GUIDE.md`

~400 rader. Komplett guide som vilken agent eller session som helst kan följa utan ytterligare kontext:

- Polaroid 600-specifikation
- Screenshot-lagring och filstruktur
- Bildstorleksgränser (max 800px, max 200KB)
- Stitch-referenshantering
- Wave-för-wave checklists för F37 (4 waves) och F38 (4 waves)
- Seed data-krav
- COMPARISON.md-mall
- Felhantering

### `~/bin/resize-screenshot.sh`

Krymper screenshots så Claude inte hänger sig på stora bilder.

```bash
~/bin/resize-screenshot.sh <fil_eller_mapp> [max_bredd]
# Default: 800px, optimerad PNG
```

### `~/bin/verify-wave-screenshots.sh`

Gate script som MÅSTE exit 0 innan en wave kan markeras DONE.

```bash
~/bin/verify-wave-screenshots.sh <feature-dir> <wave-number>
```

Kontrollerar:

- `stitch-reference/` har bilder
- `wave{N}/run{M}/` finns med PNG:er
- Alla bilder under 800px bred / 200KB
- `COMPARISON.md` finns med PASS/FAIL-poster
- Inga FAIL-poster

---

## Stitch HTML-nedladdning

Alla 21 skärmar från två Stitch-projekt laddas ner (HTML + PNG):

### Projekt v1 (1086044651106222720) — 13 skärmar

| Skärm | Typ | Feature |
|---|---|---|
| Mobile Community Feed - Polaroid Gallery | MOBILE | F37 |
| Samuel's Profile - Polaroid Stack | MOBILE | F37 |
| Revised Discovery - Vertical Stack | MOBILE | F37 |
| Revised Community Feed - Warm Cream & Copper | MOBILE | F37 |
| Discovery Screen - Polaroid Stack | MOBILE | F37 |
| Samuel's Profile - Enhanced Polaroid Stack | MOBILE | F37 |
| Revised Desktop Feed - Refined Polaroids | DESKTOP | F38 |
| Refined Desktop Profile - Realistic Proportions | DESKTOP | F38 |
| Samuel's Desktop Profile - Polaroid Gallery | DESKTOP | F38 |
| Desktop Feed - Realistic Polaroid Proportions | DESKTOP | F38 |
| Desktop Community Feed - Polaroid Masonry | DESKTOP | F38 |
| Desktop Discovery - Polaroid Grid | DESKTOP | F38 |
| Revised Polaroid Grid - Realistic Proportions | DESKTOP | F38 |

### Projekt v2 (3228541579636523619) — 8 skärmar

| Skärm | Typ | Feature |
|---|---|---|
| Lustre: It's a Connection! | MOBILE | F37 |
| Lustre Chat Inbox | MOBILE | F37 |
| Welcome to Lustre | MOBILE | F37 |
| Edit Profile | MOBILE | F37 |
| Lustre Mobile Chat: Emma | MOBILE | F37 |
| Lustre: Desktop Match Notification | DESKTOP | F38 |
| Lustre Desktop Chat Inbox | DESKTOP | F38 |
| Lustre: Desktop Edit Profile | DESKTOP | F38 |

### Lagring

```
.bmad/features/building/F37-polaroid-mobile/screenshots/stitch-reference/
  html/           <- 11 HTML-filer (implementeringskod)
  *.png           <- 11 referensbilder
  INDEX.md        <- Mappning fil -> skarm -> target-komponent

.bmad/features/building/F38-polaroid-web/screenshots/stitch-reference/
  html/           <- 10 HTML-filer
  *.png           <- 10 referensbilder
  INDEX.md
```

---

## F37 & F38 Roadmaps (aterstallda)

Bada features har kod som kompilerar men noll visuell verifiering:

- **Status:** `IN_PROGRESS — code complete, visual verification NOT done`
- **Alla waves:** `NEEDS_VISUAL_VERIFICATION — code verified, zero screenshots taken`
- **Epics:** Markerade VERIFIED (koden finns och kompilerar)
- **Alla visuella testgate-items:** Ej checkade `[ ]`
- **Gate script-rad tillagd i varje waves testgate**

F38 flyttad tillbaka fran `done/` till `building/`.

**Nasta steg:** Nar Stitch HTML ar nedladdad omplaneras bada roadmaps sa epics refererar Stitch-filer. Sedan kan `/bygg-ui` koras pa dem.

---

## Sammanfattat flode

```
/planera-ui F99-ny-feature
  |
  Stitch HTML laddas ner (BLOCKING)
  Stitch analyseras -> stitch-analysis.md
  Skarmar mappas till filer
  bmad-planner kor med Stitch-kontext
  Roadmap verifieras (8-punkts checklist)
  |
  v
/bygg-ui F99-ny-feature
  |
  Startup: verifierar HTML + PNG finns
  Per wave:
    B1: identifierar Stitch-filer for vagen
    B2: epic-builders far "Konvertera denna HTML"
    B3: verifierar kod + Stitch-likeness
    V1: startar app, laddar seed data, tar screenshots
    V2: jamfor screenshots mot Stitch-referens
    V3: skriver COMPARISON.md
    V4: gate script MASTE exit 0
    B7: gate script igen -> git commit
    B8: uppdaterar roadmap med verifieringsblock
  |
  v
  Alla waves: DONE med screenshots, COMPARISON.md, gate PASS
```

---

## Regler att propagera

Dessa regler galler alla system som bygger eller planerar UI/UX-features:

1. **"CODE REVIEW PASS" ar ALDRIG ett substitut for visuell verifiering**
2. **Gate script `verify-wave-screenshots.sh` maste exit 0 innan wave markeras DONE**
3. **Gate script kors TVA ganger per wave:** en gang i V4, en gang i B7 (pre-commit)
4. **Screenshots maste visa RIKTIG DATA fran running app** — inte spinners, inte tomma skarmar
5. **COMPARISON.md maste beskriva vad som FAKTISKT SYNS** — inte vad koden sager
6. **Stitch HTML ar implementeringsbas** — epics konverterar, de bygger inte fran scratch
7. **Alla bilder max 800px breda, max 200KB** — resize med `~/bin/resize-screenshot.sh`
8. **PARTIALLY_APPROVED existerar inte i /bygg-ui** — waves ar DONE eller IN_PROGRESS
9. **Fix-loopen har ingen grans** — den kor tills 100% PASS eller user intervenerar
10. **Seed data maste laddas innan screenshots** — `cd services/api && npx prisma db seed`

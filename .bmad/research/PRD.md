# Product Requirements Document (PRD)
# Arbetsnamn: [TBD] — Sexpositivt Socialt Nätverk & Utbildningsplattform

**Version:** 2.0
**Datum:** 2026-03-24
**Författare:** Samuel + Claude
**Status:** Draft

---

## 1. Vision

Vi bygger Sveriges första moderna, mobilfirst sexpositivt socialt nätverk — en plattform där vuxna kan utforska sin sexualitet, träffa likasinnade, lära sig och utvecklas, och vara helt öppna med sina begär, utan rädsla, skam eller obehag.

Det här handlar om intimitet mellan vuxna samtyckande människor. Vi moraliserar inte. Vi bygger verktyg som gör redan existerande beteenden tryggare, mer tillgängliga och mer jämlika.

Vi är inte en dejtingapp med sociala features — vi är ett socialt nätverk med inbyggd dejting, utbildning, events, marknadsplats och branschledande säkerhetsverktyg.

Vi optimerar för kunders upplevelse och nöjdhet och att vi löser FAKTISKA problem. Vi ska tjäna pengar, men vi ska inte optimera för pengar. Vi ska skapa något genuint bra.

---

## 2. Problemformulering

### 2.1 Marknaden idag

Den svenska marknaden för sexuella kontakter och sexpositivt community-byggande betjänas idag av föråldrade plattformar:

- **BodyContact** (1998) — 265K medlemmar, 6K online, men kör PHP utan HTTPS, design från 2012, ingen mobilapp, inga realtidsfunktioner
- **Diversia/Darkside** (2003) — 150K medlemmar, nischad kink/BDSM, inte en hookup-plattform
- **C-Date** — 450K svenska medlemmar, men internationellt styrd, predatory avbokningspolicy
- **AFF** — 350K svenska, 80% män, dyrt, klumpigt, skadat rykte efter dataläcka

Ingen av dessa plattformar har:
- Modern mobilupplevelse
- AI-driven matchning eller moderation
- Realtidskommunikation (chat, video, röst)
- Verifierad identitet
- Säkerhetssystem för fysiska möten
- Sociala funktioner (feed, shorts, grupper)
- Event- och organisationsverktyg
- Marknadsplats
- Utbildning i social kompetens, sexuell hälsa eller kommunikation

### 2.2 Grundproblemet: Könsbalansen

Alla existerande plattformar lider av extrem mansdominans:

| Platform | Män | Kvinnor |
|----------|-----|---------|
| BodyContact | 75.5% | 6.5% |
| AFF | 80% | 20% |
| FetLife | 75% | 25% |
| Ashley Madison | 70% | 30% |

Detta skapar en ond cirkel: kvinnor överöses med irrelevanta meddelanden → kvinnor lämnar → ännu sämre ratio → ännu värre upplevelse.

### 2.3 Det specifika problemet för kvinnor

En kvinna på BodyContact med en tydlig profil som beskriver exakt vad hon söker får dagligen hundratals meddelanden från män som inte ens läst hennes profil. Resultatet:

1. Hon orkar inte längre svara
2. Hon slutar logga in
3. Hon tar bort sitt konto
4. En potentiellt bra kontakt försvinner från plattformen

Varje kvinna som lämnar gör plattformen sämre för alla.

Samma problem finns på ALLA dejtingplattformar — inte bara vuxen-dejting. Kvinnor på Tinder har 2000+ likes i kön utan möjlighet att filtrera. AI Gatekeeper löser detta för alla typer av dejting.

### 2.4 Problemet för män

Miljontals män vet inte hur de ska kommunicera med kvinnor. De har aldrig fått verktyg eller utbildning. Detta leder till:

1. Social ångest, stress och depression
2. Dåliga meddelanden som aldrig får svar
3. I brist på bra förebilder vänder sig många till toxiska "dating gurus"
4. Resultatet: sämre beteende mot kvinnor, inte bättre

Ingen plattform hjälper aktivt män att bli bättre. Alla klagar på mäns beteende men ingen ger dem verktyg.

### 2.5 Problemet med sexuell utbildning

De flesta vuxna har aldrig fått meningsfull utbildning i:
- Sexuell hälsa bortom grundläggande biologi
- Kommunikation om desire, gränser och fantasier
- Fysisk intimitet och hur man ger njutning
- Relationshantering, svartsjuka, öppna relationer
- Kink/BDSM — safe practices, consent, aftercare
- Mental hälsa kopplat till sexualitet och relationer

Befintlig utbildning (Omgyes, sexologer, böcker, kurser) är fragmenterad, dyr och passiv (du tittar på video). Ingen plattform erbjuder AI-first, dynamisk, personaliserad sexuell utbildning.

### 2.6 Sekundära problem

- **Säkerhet vid möten** — ingen plattform erbjuder verktyg för fysisk säkerhet när man träffar en främling
- **Hämnporr** — utbredd och förödande, inga verktyg för säker delning av intimt material
- **Fake profiles** — ingen pålitlig verifiering
- **Fragmenterat community** — hookups på en sajt, kink-diskussioner på en annan, events på en tredje, marknadsplats ingenstans
- **Skam och stigma** — föråldrade plattformar med "smuttig" känsla avskräcker normala människor
- **Ingen mobilupplevelse** — i en marknad där 70%+ surfar på mobilen

---

## 3. Lösning

### 3.1 Produktöversikt

En mobilfirst-plattform med sex sammankopplade pelare:

1. **Social** — feed, shorts, grupper, posts, dagböcker
2. **Connect** — profiler, AI-matchning, AI Gatekeeper, chat/video/röst
3. **Meet** — events (online + IRL), organisationer, klubbar
4. **Safe** — SafeDate, ConsentVault, verifiering, anonymitet, innehållsfilter
5. **Learn** — AI Dating Coach, sexuell hälsa, relationsutbildning, dynamiskt content
6. **Shop** — marknadsplats, business webshops, annonsplattform

### 3.2 Dual-mode: Vanilla ↔ Spicy

Plattformen har två lägen som användaren kan toggla mellan:

**Vanilla mode (default):**
- Profiler visar: namn, ålder, bilder, bio, vad man söker (relation, dejt, vänskap)
- Feed: SFW content, dejting-tips, sociala posts
- Sökning: standard dejtingfilter
- Learn: social kompetens, kommunikation, sexuell hälsa
- Ser ut som Hinge/Bumble — ingen skäms för att visa telefonen

**Spicy mode (toggle):**
- Kinks och intressen synliga
- Explicit content i feed (baserat på personliga filter)
- Avancerade sökfilter (kinks, relationstyp, par-sökning)
- Events, grupper, marknadsplats för vuxeninnehåll
- ConsentVault
- Learn: dirty talk, BDSM, fysisk intimitet
- Full tillgång till allt plattformen erbjuder

**Korsning:**
- En person i vanilla-mode ser INTE spicy-profiler (om de inte matchar på vanilla-nivå)
- En person i spicy-mode ser ALLA men vanilla-profiler visas utan kink-data
- Matchning funkar inom och mellan lägen men bara på gemensam nivå

### 3.3 Grundprinciper

1. **Consent i centrum** — varje interaktion bygger på samtycke, från meddelanden till inspelningar
2. **Anonymitet som standard** — riktigt namn lagras krypterat, visas aldrig, undantag bara vid polisutredning
3. **Kvinnor först** — designa varje funktion utifrån "skulle en kvinna känna sig trygg med detta?"
4. **Inkluderande** — alla läggningar, identiteter och uttryck välkomna
5. **Ingen moralisk bedömning** — vi bygger verktyg, inte åsikter
6. **Säkerhet som feature** — inte en efterhandskonstruktion utan en kärnprodukt
7. **Transparens** — tydligt vad vi lagrar, varför, och vem som kan se det
8. **Osynlig betalning** — appen ska aldrig påminna om pengar, allt "bara funkar"
9. **Evidensbaserat** — utbildning bygger på empiri och forskning, inte ideologi

---

## 4. Målgrupp

### 4.1 Primär

- **Kvinnor 25-45** — vill utforska sin sexualitet men avskräcks av befintliga plattformars dåliga upplevelse. Nyckeln till hela plattformens framgång.
- **Par 28-50** — söker andra par, enskilda personer, eller nya upplevelser tillsammans
- **Män 25-50** — söker genuina kontakter, villiga att anstränga sig och respektera gränser

### 4.2 Sekundär

- **LGBTQ+** — bisexuella, homosexuella, transpersoner, ickebinära, queera
- **Kink/BDSM-communityt** — dom/sub, fetischister, rollspelare
- **Polyamorösa/ENM** — öppna relationer, relationsanarkister
- **Swingers** — par som söker par eller enskilda
- **Arrangörer** — swingersklubbar, kinkföreningar, eventarrangörer
- **Företag** — sexleksaksbutiker, underklädesföretag, hälsotjänster
- **Vanilla-daters** — "vanlig" dejting med bättre verktyg (AI Gatekeeper, SafeDate)

### 4.3 Personas

**Lisa, 32 — Nyfiken i par:**
Lisa är sambo med Markus. De har pratat om att utforska swingerlivsstilen men vet inte var de ska börja. Lisa har haft ett konto på BodyContact men tog bort det efter en vecka — hon fick 200+ meddelanden på tre dagar, varav kanske 5 var relevanta. Resten var "hej vill du knulla" från killar som inte läst att hon söker par, inte enskilda män.

**Erik, 38 — Engagerad men osynlig:**
Erik är singel och sexuellt nyfiken. Han skickar välskrivna meddelanden men får sällan svar — för kvinnorna drunknar i meddelanden. Han är villig att anstränga sig men får aldrig chansen att visa det.

**Alex, 29 — Ickebinär och kinkintresserad:**
Alex identifierar sig som ickebinär. FetLife har community men känns dött. Tinder är inte inkluderande. Feeld finns knappt i Göteborg.

**Marcus, 26 — Social ångest:**
Marcus har svårt att prata med kvinnor. Han har aldrig haft en flickvän. Han har börjat titta på "red pill"-content på YouTube och märker att det gör honom bitter. Han vill bli bättre men vet inte hur. Han behöver en coach, inte en guru.

**Sara, 35 — Vanilla med nyfikenhet:**
Sara vill dejta "vanligt" men är trött på Tinder/Hinge. 2000 likes utan möjlighet att filtrera. Hon hade velat att någon sorterade bort alla "hej"-meddelanden. Om hon sedan upptäcker att plattformen har mer att erbjuda — kanske.

---

## 5. Feature-specifikation

### 5.1 PELARE 1: SOCIAL

#### 5.1.1 Profiler

**Identitet:**
- Displaynamn (valfritt, inte riktigt namn)
- Riktigt namn lagras krypterat, visas ALDRIG i appen (undantag: polisutredning med domstolsbeslut)
- Ålder (verifierad via Swish + registeruppslag)
- Verifieringsbadge ("verifierad person")
- Profilbilder (med intelligent AI-klassificering)
- Valfri ansiktsblurrning på profilbilder

**Kön/identitet:**
- Man, kvinna, transperson (MtF), transperson (FtM), ickebinär, genderfluid, genderqueer, intersex, annan, vill ej ange
- Möjlighet att lägga till fritext
- Pronomen

**Sexuell läggning:**
- Hetero, homo, bi, bisexuell-nyfiken, pansexuell, asexuell, demisexuell, queer, annan, hemligt

**Relationstyp:**
- Singel, i relation, sambo, gift, särbo, öppen relation, polyamorös, relationsanarkist, vill ej ange

**Vad jag söker:**
- Multi-select: hookup, FWB, regelbunden sexkompis, förhållande, vänskap, events/community, par, gruppsex, specifik kink, nätflirt/sexting, vet inte ännu
- Fritext-beskrivning

**Intressen/kinks (Spicy mode):**
- Taggbaserat system med 100+ fördefinierade taggar organiserade i kategorier
- Kategorier: Vanilla, BDSM (dom, sub, switch, rigger, rope bunny...), Fetisch, Rollspel, Grupp, Par, Voyeurism/Exhibitionism, Tantra, Massage, Annat
- Varje tagg har tre nivåer: "Nyfiken", "Gillar", "Älskar"
- Fritext-taggar möjligt
- Taggar kan vara publika eller privata (visas bara för matchningar)

**Fysiskt:**
- Ålder, längd, kroppstyp, hårfärg, ögonfärg — allt valfritt

**Parprofilering:**
- Två verifierade användare kan länka sina konton som par
- Varje person har sin egen profil med egna bilder och text
- Parprofilen visas som en sammankopplad enhet i sökning
- Upp till 5 personer kan länkas (poly-konstellationer)
- Varje person styr sin egen del

**Coaching-badges och medaljer:**
- Synliga på profilen (om användaren vill)
- Fungerar som trust signals
- Se sektion 5.5 för fullständig lista

#### 5.1.2 Feed ("For You")

**Innehållstyper:**
- **Posts** — text med valfria bilder
- **Shorts/Reels** — korta videos (max 60 sekunder)
- **Stories** — försvinner efter 24 timmar
- **Dagbok** — längre texter, blogformat
- **Polls** — frågor med svarsalternativ
- **Delade events** — "Jag ska på [event], någon mer?"
- **Marknadsplatslistningar** — produkter som lyfts in i feeden
- **Learn-content** — AI-genererade artiklar, podcasts, tips (se 5.5)
- **Annonser** — native feed-annonser från businesses (se 5.6)

**AI-kuraterad feed:**
- Algoritmen viktar: intressen, interaktioner, profil-matchning, lokation, nyhet
- Blandar content-typer för variation
- Prioriterar content från folk som matchar dina preferenser
- "Visa mindre sådant här"-knapp på varje content-item
- Aldrig echo-chamber — medveten blandning av bekant och nytt

**Intelligent innehållsklassificering:**

Varje content-item klassificeras automatiskt av AI med multi-label-taggar:

| Dimension | Taggar |
|-----------|--------|
| Klädesgrad | Fullt klädd, suggestiv, underkläder, topless, naken |
| Kropp i fokus | Ansikte, överkropp, underkropp, penis, vulva, bröst, rumpa |
| Aktivitet | Poserar, solo-sex, par-sex, BDSM, massage, dans, vardag |
| Vibe | Romantiskt, lekfullt, explicit, hårt, fetisch, humor |
| Kön i bild | Man, kvinna, par, grupp, trans, ickebinär |

Klassificeringen är INTE binär SFW/NSFW. Den är multidimensionell så att användare kan fingranulärt styra vad de ser.

**Användarstyrda filter:**

Vid onboarding — snabb-preset:
- "Soft & romantic" — ingen explicit content i feed
- "Open to everything" — blandning av allt
- "Explicit OK" — även explicit content i feed
- "No dick pics" — AI filtrerar bort bilder med penis i fokus

Detaljerade filter i inställningar:
- Toggles per klassificering
- "Visa max klädesgrad: [slider]"
- "Dölj content med: [specifika taggar]"
- "Visa bara content från: [kön/identitet]"

**Anti-unsolicited-dick-pic-filter (dedikerad feature):**

AI:n detekterar penisbilder i meddelanden, feed och profiler. Om mottagaren har filtret aktiverat:
1. Bilden blurras med "Denna bild har filtrerats baserat på dina inställningar. Visa ändå?"
2. Avsändaren vet INTE att bilden filtrerats
3. Konsekvent "visa inte" → AI:n lär sig och filtrerar hårdare
4. Upprepade filtrerade meddelanden → automatisk varning → temporär ban → permanent ban

Marknadsförs aktivt: **"Den första appen där du aldrig behöver se en dick pic du inte bett om."**

#### 5.1.3 Intressegrupper

- Användarskapade grupper kring teman
- Öppna eller privata (kräver godkännande)
- Modererade av skaparen + utsedda moderatorer
- Egen chatt, eget forum, egna events
- AI-assisterad moderation
- Grupper kan vara kopplade till organisationer

#### 5.1.4 Dagbok/Blogg

- Personlig dagbok, kronologisk
- Publik, bara för kontakter, eller privat
- Kommentarer och likes
- Taggbar med intressetaggar
- Importerbar från BodyContact (migration)

---

### 5.2 PELARE 2: CONNECT

#### 5.2.1 AI Gatekeeper — Kärnfeature

**Problemet:** Kvinnor på ALLA dejtingplattformar — inte bara vuxen-sajter — överöses med irrelevanta meddelanden. En kvinna på Tinder har 2000+ likes utan möjlighet att filtrera. En kvinna på BodyContact med texten "Par söker par, ej enskilda män" får hundratals meddelanden från enskilda män.

**Lösningen:** När någon vill kontakta en person med Gatekeeper aktiverad möts de först av en AI-assistent som:

1. **Vet vad mottagaren söker** — har läst profilen, preferenser, dealbreakers
2. **Kvalificerar avsändaren** — ställer frågor baserat på mottagarens kriterier
3. **Bedömer matchning** — avgör om avsändaren rimligen matchar
4. **Släpper igenom eller avvisar** — med respektfull feedback

**Detaljerat flöde:**

Steg 1 — Erik vill skriva till Lisa:
> Erik trycker "Skicka meddelande" på Lisas profil.

Steg 2 — AI Gatekeeper aktiveras:
> **AI:** "Hej Erik! Lisa har valt att använda AI-filtret. Jag vill ställa några frågor för att se om ni kan vara en bra match. Lisa söker par — är du en del av ett par?"
>
> **Erik:** "Ja, jag och min sambo Anna söker ett annat par"
>
> **AI:** "Lisa och Markus söker par i Stockholmsområdet, 28-40 år. Stämmer det in på er?"
>
> **Erik:** "Ja, vi bor i Solna, jag är 35 och Anna 32"
>
> **AI:** "Lisa har angett att hon är intresserad av soft swap. Är det något ni är öppna för?"
>
> **Erik:** "Absolut, vi är nya i livsstilen och vill börja soft"

Steg 3 — AI:n bedömer: par ✓, ålder ✓, location ✓, intressen ✓ → Släpper igenom

Steg 4 — Lisa ser:
> **Nytt meddelande från Erik (AI-kvalificerad ✓)**
> "Erik och hans sambo Anna (35/32, Solna) söker soft swap med par. AI-matchning: Hög"
> Under: Eriks faktiska meddelande.

**Om Erik inte matchar:**
> **AI:** "Tyvärr verkar det som att du och Lisa söker olika saker just nu. Lisa söker specifikt par, och du beskriver dig som singel. Kan jag hjälpa dig hitta profiler som matchar bättre?"

AI:n avvisar aldrig med "du är inte bra nog" — alltid med "ni söker olika saker" och ett konstruktivt alternativ.

**Konfiguration för mottagaren:**
- Gatekeeper PÅ/AV (default PÅ för kvinnliga profiler, alla kan aktivera)
- Striktnivå: Mild / Standard / Strikt
- Egna frågor som AI:n ska ställa
- Dealbreakers (hårda filter som automatiskt avvisar)
- AI-ton: formell, avslappnad, flirtig

**Viktiga regler:**
- Pengar kan ALDRIG köpa bypass. Inte till salu. Pengar ska aldrig kunna köpa tillgång till en person som inte vill bli kontaktad.
- Ömsesidig matchning (båda likat varandra) → Gatekeeper hoppar över
- Paraprofiler → AI:n kvalificerar paret, inte individen

#### 5.2.2 Matchning

**Passiv matchning:**
- AI analyserar profildata, intressen, kinks, preferenser
- Dagliga förslag: "Dessa profiler matchar dig väl"
- Kompatibilitetspoäng

**Aktiv sökning:**
- Filterbaserad: kön, ålder, location, intressen, kinks, relationstyp, online-status
- Kartsökning: visa profiler nära mig
- "Senast aktiva"-filter (löser BodyContacts/SDCs "digital graveyard")
- Spara sökningar som favoriter

**Swipe-discovery:**
- Valfritt swipe-gränssnitt
- Like/Pass/Super-like
- Mutual likes → direkt kontakt

#### 5.2.3 Kommunikation

**Chat:**
- End-to-end-krypterad textchat
- Bilder och videos (med intelligent innehållsfilter)
- Ephemeral-läge: meddelanden försvinner efter vald tid
- Screenshot-blockering
- Läskvitton (valfritt)
- Typing-indikator

**Röstchat:**
- Direktsamtal via appen, WebRTC
- Inspelning bara med explicit consent

**Videochat:**
- 1:1 videosamtal
- Valfri bakgrundsblurrning (anonymitet)
- Gruppvideo för events

**Gruppchatt:**
- Upp till 50 deltagare
- Kopplat till grupper eller events
- Moderatorsverktyg

#### 5.2.4 Adressbok och relationer

- Spara kontakter som favoriter med taggar
- Blockera (personen vet inte att de är blockerade)
- Ignorera (meddelanden i separat mapp)
- Rapportera (kategoriserat)

---

### 5.3 PELARE 3: MEET

#### 5.3.1 Events

**Event-typer:**
- Online (videomöte via appen)
- IRL (fest, munch, workshop, swinger-kväll)
- Hybrid
- Engångshändelse eller återkommande

**Skapa event:**
- Titel, beskrivning, datum/tid, plats
- Målgruppsfilter: kön, åldersintervall, intressen/kinks, verifieringskrav, geografisk radie
- Bara matchande profiler kan se eventet
- Pris: gratis eller betalt (biljettförsäljning via plattformen)
- Kapacitet

**Delta i event:**
- RSVP
- Gästlista (synlig eller dold)
- Event-chatt
- Påminnelser

**Post-event:**
- "Du var på samma event som..." (opt-in)
- Event-reviews
- Delade foton/media (med consent)

**Event-discovery:**
- Kartsökning
- Kalendervy
- AI-rekommenderade events
- Filter

#### 5.3.2 Organisationer / B2B

Swingersklubbar, BDSM-föreningar, eventföretag, sexshoppar kan skapa organisationsprofiler:

**Profil:**
- Verifierad organisationsprofil (manuell granskning, engångsavgift ~500 SEK)
- Beskrivning, bilder, öppettider, location

**Medlemskap:**
- Egna "medlemmar" i appen
- Interna chattar och events
- Nyhetsbrev/utskick

**Event-verktyg:**
- Skapa och hantera events
- Biljettförsäljning
- Gästlistor och incheckning
- Deltagarstatistik

**Webshop i appen:**
- Egen produktkatalog med bilder och priser
- Betalning via plattformens Swish (anonymt för köparen)
- Orderhantering och chat med kunder
- Analytics

**Annonsverktyg:**
- Självbetjäning: skapa annonser, välj målgrupp, budget
- CPM/CPC-baserat
- Feed-annonser, event-sponsring, stories-annonser
- Analytics: visningar, klick, konverteringar

**Prissättning för businesses:**
- Ingen månadsavgift
- Engångsverifiering: 500 SEK
- Provision per transaktion (shop + events): 10-15%
- Annonsering: CPM/CPC, self-serve

---

### 5.4 PELARE 4: SAFE

#### 5.4.1 Identitetsverifiering via Swish

**Flöde:**
1. Ny användare swishar 10 SEK (gratis för kvinnor under kampanjer)
2. Swish Handel-API returnerar: namn + telefonnummer
3. Automatisk uppslag mot SPAR via Roaring.io: namn + telefon → födelsedatum
4. Under 18 → konto nekas, 10 SEK returneras
5. Över 18 → konto aktiverat, verifieringsbadge tilldelas
6. Riktigt namn lagras krypterat (AES-256), aldrig visat i appen

**Kostnad:** ~2-3 SEK per verifiering

**Garantier:**
- Personen är en riktig svensk vuxen (18+)
- En person = ett konto (kopplat till unikt personnummer)
- Juridisk spårbarhet vid brott

**Nordisk expansion:** NemID/MitID (Danmark), Vipps (Norge), suomi.fi (Finland)

#### 5.4.2 Anonymitetspolicy

**Grundregel:** Riktigt namn visas ALDRIG i appen. Inte i profilen, inte i chatten, inte i transaktioner, inte i event-gästlistor. Aldrig.

**Undantag — data lämnas ut vid:**
1. Domstolsbeslut i brottsutredning
2. SafeDate-larm (koordinater + identitet till polis/SOS)
3. ConsentVault-juridisk tvist (bevis om samtycke)

**Kommuniceras vid registrering:**
> "Ditt riktiga namn lagras krypterat för din säkerhet. Vi visar det aldrig i appen och lämnar aldrig ut det utan domstolsbeslut. Men om någon begår brott mot dig på vår plattform kan vi hjälpa rättsväsendet att ställa dem till svars."

#### 5.4.3 SafeDate — Säkerhetssystem för fysiska möten

**Aktivering:**
1. Aktivera SafeDate, ange vem/var/hur länge
2. Välj säkerhetskontakter (vänner och/eller SOS)
3. Appen loggar GPS kontinuerligt
4. Valfritt: dela live-position med säkerhetskontakter

**Under mötet:**
- GPS loggas krypterat
- Diskret SOS: triple-tap på power-knapp eller hemlig gest i appen
- Timer räknar ned

**Eskaleringskedja vid utebliven check-in:**
1. Appen ringer: "Allt bra?" (bekräfta med PIN/röst)
2. Svarar + bekräftar → OK, GPS-logg raderas efter 24h
3. Svarar + förlänger → ny timer
4. Svarar inte inom 5 min → SMS + koordinater till säkerhetskontakter
5. Ingen respons inom 10 min → 112-samtal med namn, GPS, vem hon skulle träffa
6. Parallellt: mikrofon aktiveras, ljudström + GPS streamas

**SOS-integration:** Fas 1: bara kontaktpersoner. Fas 2: 112 via SOS Alarms API.

**Gratis. Alltid. Säkerhet ska aldrig kosta.**

#### 5.4.4 ConsentVault — Säker videoinspelning med samtycke

**Syfte:** Möjliggöra säker inspelning av intima stunder med fullständigt samtyckesramverk som förhindrar hämnporr.

**Aktivering:**
1. Båda i samma rum (Bluetooth/NFC proximity check)
2. Båda öppnar ConsentVault
3. Consent-prompt med Swish-verifierad identitet (juridiskt bindande)
4. Consent loggas: timestamp, GPS, båda parters identitet

**Under inspelning:**
- Video streamas krypterat till ConsentVault-server (ingenting lokalt)
- Osynlig vattenmärkning kopplad till båda parter

**Permissions:**

| Funktion | Tillåtet | Detaljer |
|----------|----------|---------|
| Titta | Ja | Båda måste ha "access active" |
| Ladda ner | Nej | Aldrig. Streaming only |
| Casta till TV | Ja | Inom appen, DRM förhindrar screen recording |
| Dela till andra | Ja | Kräver BÅDA parters consent. Revoke → alla förlorar access |
| Revokera | Ja | Endera parten, omedelbar effekt |
| Återinstatera | Ja | Om båda instatar → access tillbaka |
| Permanent radering | Ja | Endera parten. Oåterkalleligt |

**DRM:** Widevine L1, osynlig vattenmärkning, screen recording-detection.

**Juridiskt:** Digitalt samtycke via verifierad identitet + timestamps + GPS = bevis vid hämnporrbrott (BrB 4:6c).

#### 5.4.5 Datalagring

| Data | Lagringstid | Kryptering | Utlämning |
|------|-------------|------------|-----------|
| Riktigt namn | Tills konto raderas | AES-256 | Domstolsbeslut |
| Meddelanden | 90 dagar efter radering | E2E + server-side | Domstolsbeslut |
| GPS (SafeDate) | 24h efter avslutad | AES-256 | Vid aktivt larm |
| ConsentVault-videos | Tills permanent radering | AES-256 | Domstolsbeslut |
| IP-loggar | 12 månader | AES-256 | Domstolsbeslut |
| Betalningshistorik | 7 år (bokföringslagen) | AES-256 | Domstolsbeslut |

---

### 5.5 PELARE 5: LEARN

#### 5.5.1 Överblick

Learn är en fullständig utbildningsplattform integrerad i appen med tre huvudområden:

1. **AI Dating Coach** — social kompetens och attraktion (främst för män)
2. **Sexuell Hälsa & Utbildning** — för alla kön och identiteter
3. **Relationer & Kommunikation** — för alla

All utbildning är **AI-first och dynamisk**. Istället för statiska videokurser genereras content i realtid, anpassat till användarens nivå, intressen och språk.

#### 5.5.2 Content-format

| Format | Beskrivning | Användning |
|--------|-------------|-----------|
| **AI-videosamtal** | LiveKit-samtal med AI-person (coach, övningspartner, lärare) | Coaching-sessioner, övningsscenarier, Q&A |
| **AI-telefonsamtal** | Röstsamtal med AI (lägre bandbredd, mer tillgängligt) | Quick coaching, frågor, pep-talk |
| **AI-podcast** | Dynamiskt genererad podcast-episod baserat på ämne/fråga | Lyssna under pendling, träning. Två AI-röster diskuterar |
| **Prefab video** | Förinspelade videos (där mänskligt content är överlägset) | Expertintervjuer, demonstrationer, gästföreläsningar |
| **Interaktiva scenarier** | AI-driven rollspelsövning med video/röst | Övning av social kompetens, dirty talk, svåra samtal |
| **Artiklar/guider** | AI-genererad text anpassad till användarens nivå | Referensmaterial, steg-för-steg-guider |
| **Quizzes** | Interaktiva kunskapstest och självinsiktsövningar | Bedömning, reflektion |

**Dynamiskt vs prefab — principen:**
Dynamiskt AI-content när det går (personaliserat, på användarens språk, interaktivt). Prefab video när mänsklig närvaro ger genuint mervärde (expertintervjuer, verkliga demonstrationer, personliga berättelser).

**Flerspråkigt:** AI-content genereras på användarens valda språk. Svenska, norska, danska, finska, engelska från start. Ytterligare språk utan extra utvecklingskostnad.

#### 5.5.3 AI Dating Coach (främst för män)

**Filosofi:**

Coachen bygger på evidensbaserad förståelse av attraktion och social dynamik, inte ideologi. Grundprinciper:

1. **Var autentisk, inte perfekt.** Bli en bättre version av dig själv, inte någon annan.
2. **Lekfullhet, inte manipulation.** En lekfull "neg" i Todd V:s anda är flirt. Det är roligt. Det signalerar att du inte sätter henne på en piedestal.
3. **Polarisering, inte people-pleasing.** Stå för något. Ha gränser. Säg nej ibland.
4. **Förstå attraktion empiriskt.** Lär ut vad forskning och erfarenhet visar att kvinnor faktiskt responderar på — inte vad som är politiskt korrekt att säga. Det är ofta helt olika saker.
5. **Maskulinitet är positivt.** Det är OK att vara stark, beslutsam, beskyddande, tävlingsinriktad. Toxiskt är när dessa egenskaper används MOT andra. Hälsosam maskulinitet handlar om att använda sin styrka FÖR andra.
6. **Consent som naturlig del av flirt.** Consent ska inte vara en broms utan en del av spänningen.

**Content-källor:**

| Källa | Vad vi tar |
|-------|-----------|
| Todd V | Lekfull social dynamik, naturlig attraktion, hantera avvisning |
| Mark Manson | Autenticitet, sårbarhet, "Models"-ramverket |
| Corey Wayne | Maskulint ledarskap i relationer |
| Patrice O'Neal | Ärlighet, humor, att inte vara en pushover |
| Robert Glover | "Nice Guy"-syndromet, hälsosamma gränser |
| Gottman Institute | Vetenskaplig kommunikation |
| Esther Perel | Erotik, desire, mystery |

**Explicit INTE:** Andrew Tate, Fresh & Fit, red pill/black pill/incel-retorik, PUA-klassiker (Mystery/Style), men HELLER INTE extrem "feminist ally"-coaching som säger att alla maskulina impulser är problematiska.

**Tre komponenter:**

**1. AI Coach (manlig röst/video) — "Din wingman"**
- Personlig mentor som följer din utveckling
- Ger uppdrag anpassade efter nivå
- Utvärderar, uppmuntrar, ger konstruktiv feedback
- Ton: stöttande äldre bror. Ärlig utan att vara dömande.

Exempel på coachens ton:
> "Okej, du frös till när hon tittade på dig. Helt normalt. Din hjärna tolkar det som fara — men det är det inte. Vet du vad som händer om du går fram och hon inte är intresserad? Ingenting. Du går därifrån med exakt samma liv som innan, men med lite mer mod i ryggen. Nästa gång, räkna till tre och gå."

**2. AI Samtalspartner (kvinnlig röst/video) — "Övningspartner"**
- LiveKit-videosamtal med AI-genererad kvinna
- Realistiska scenarier med stigande svårighetsgrad
- Reagerar naturligt — ibland positivt, ibland avvisande, ibland neutralt
- Ju bättre du blir, desto mer realistisk och utmanande blir hon

**3. Certifiering och gamification** (se nedan)

**Vanilla-moduler (10 nivåer):**

| Nivå | Modul | Mål |
|------|-------|-----|
| 1 | Övervinn rädslan | Våga ta steget. Säga hej. |
| 2 | Starta konversation | Prata med vem som helst. Hitta gemensamt. |
| 3 | Flirta med respekt | Lekfullhet, komplimanger, läsa signaler |
| 4 | Hantera avvisning | Emotionell resiliens. "Nej" är inte hela världen |
| 5 | Be om en dejt | Mod och timing |
| 6 | Första dejten | Genuin connection, lyssna, leda |
| 7 | Svåra samtal | Gränser, behov, förväntningar |
| 8 | Prata om sex | Uttrycka desire med respekt |
| 9 | Emotionell intelligens | Förstå dig själv och andra |
| 10 | Maskulint ledarskap | Leda utan att kontrollera |

**Spicy-moduler (8 nivåer, kräver Spicy toggle + grundnivå 6+):**

| Modul | Innehåll | Nyckelfärdighet |
|-------|----------|-----------------|
| S1: Consent som flirt | Fråga om samtycke SEXIGT: "Jag vill kyssa dig just nu" istället för kliniskt "Får jag lov?" Consent som del av spänningen, inte broms | Göra consent hett |
| S2: Dirty talk — grunder | Börja smått: beskriv vad du känner, vill göra, tycker om. Progression från suggestivt till explicit | Hitta sin röst, inte porrklyschor |
| S3: Dirty talk — avancerat | Läsa av respons. Deskriptivt, kreativt. Kontraster (ömhet + råhet). Eskalera OCH de-eskalera | Verbal finesse |
| S4: Dominans med respekt | Skillnaden mellan dominant och kontrollerande. "Ta ledningen" sexuellt tryggt. Safewords. Check-ins som inte bryter stämningen | Confident sexual leadership |
| S5: Fysisk intimitet | Beröring, tempo, läsa kroppsrespons. Eskalering: hand → arm → midja → mer. Principer, inte steg-för-steg | Fysisk social intelligence |
| S6: BDSM-introduktion | Roller, safewords, aftercare. Lättare BDSM: ögonbindel, handledsfixering, smisk. Förhandla en scen | Utforska kink tryggt |
| S7: Fantasy-kommunikation | Prata om fantasier utan pinsamhet. "Jag har tänkt på..." → "Hade du kunnat tänka dig...?" → gemensam utforskning | Öppenhet om desire |
| S8: Att ge njutning | Fokus på partnerns upplevelse. Fråga "gillar du det här?" under akten — inte osäkert utan omtänksamt och hett. Lyssna på kroppen | Generositet och uppmärksamhet |

**Consent genomsyrar VARJE spicy-modul:**
- Varje eskaleringsscenario inkluderar naturliga consent-moment
- AI-samtalspartnern tvekar ibland → mannen övar på att pausa, läsa av, backa
- Om mannen pressar → coachen bryter in med feedback
- Safeword-scenarion → öva på omedelbart stopp + aftercare

**AI samtalspartnerns beteende i spicy-scenarion:**
- Ibland älskar dirty talk → positiv feedback
- Ibland tycker det är för tidigt → verklighetscheck
- Ibland gillar viss nivå men inte mer → hitta gränsen
- Ibland reagerar negativt → hantera utan att bli defensiv
- Ibland initierar hon → mannen behöver inte alltid ta steget

Exempel på coachens ton i spicy-modul:
> "Dirty talk handlar inte om att säga snuskiga saker. Det handlar om att sätta ord på det du känner just nu, i det ögonblicket. 'Du är så jävla vacker just nu' — det är dirty talk. Det behöver inte vara mer komplicerat än så. Men det kräver att du är NÄRVARANDE."

> "Smisk. Många kvinnor gillar det. Men du börjar inte hårt. Du börjar med att lägga handen på hennes rumpa. Om hon trycker sig mot din hand — bra signal. Då kan du ge ett lätt smisk. Hennes reaktion berättar allt. Stönar hon? Mer. Spänner hon sig? Stanna. Fråga. 'Gillade du det?' Och lyssna."

#### 5.5.4 Badges och medaljer — Gamification

**Badges (progression — alla som klarar nivån får dem):**

| Badge | Modul | Innebörden |
|-------|-------|-----------|
| **First Step** | 1 | Du vågade. Mer än de flesta |
| **Icebreaker** | 2 | Du kan prata med vem som helst |
| **Playful** | 3 | Lekfull utan att vara creepy |
| **Resilient** | 4 | Ett "nej" handlar inte om ditt värde |
| **Bold** | 5 | Du vågar ta steget |
| **Connected** | 6 | Du kan skapa genuin connection |
| **Communicator** | 7 | Du kan prata om gränser och samtycke |
| **Intimate** | 8 | Du kan uttrycka desire med respekt |
| **Emotionally Fit** | 9 | Du förstår dig själv och andra |
| **Leader** | 10 | Du kan leda utan att kontrollera |
| **Consent Artist** | S1 | Du gör consent sexigt |
| **Smooth Talker** | S2 | Du har hittat din röst |
| **Wordsmith** | S3 | Verbal finesse |
| **Dominant Gentleman** | S4 | Stark och trygg |
| **Touch** | S5 | Fysisk intelligens |
| **Kink Curious** | S6 | Utforskar tryggt |
| **Open Book** | S7 | Öppen om desire |
| **Generous** | S8 | Fokus på hennes njutning |

**Medaljer (individuella prestationer — inte alla får dem):**

| Medalj | Hur man förtjänar den |
|--------|----------------------|
| **Good Listener** | Konsekvent aktiv-lyssning i övningar |
| **Comeback King** | Hanterar 5 svåra avvisningar med humor och grace |
| **Mr. Empathy** | Läser emotionella signaler rätt konsekvent |
| **Compliment Artist** | 20 genuina, specifika komplimanger (inte "du är snygg") |
| **Boundary Setter** | Kan säga nej, stå för sin åsikt, inte vara en yes-man |
| **Vulnerability Badge** | Delar genuint personligt utan att det känns tvunget |
| **Protector** | Hanterar obehaglig situation för någon annan |
| **Funny Guy** | Humor naturligt och effektivt |
| **Consistency** | 30 dagars streak |
| **Silver Tongue** | AI bedömer dirty talk som kreativt och personligt |
| **Tuned In** | Läser signaler korrekt i 90%+ av scenarion |
| **Consent Master** | Naturlig consent-kommunikation konsekvent |
| **Aftercare Champion** | Omtanke och närvaro efter intima scenarion |
| **Generous Lover** | Konsekvent fokus på partnerns upplevelse |
| **Fantasy Explorer** | Kreativ och öppen i fantasy-kommunikation |

**Gamification-mekaniker:**
- **Leaderboard** — anonym percentil: "Du är bland topp 15% denna månad." Jämfört med dig själv förra månaden.
- **Streaks** — "12 dagar i rad. Längsta streak: 18 dagar." Duolingo-modellen.
- **Unlock-progression** — högre nivåer låser upp svårare, mer realistiska scenarier
- **AI:ns svårighetsgrad skalas** — tidiga nivåer: vänlig. Senare: testar, ifrågasätter, oberäkneligt

**Social proof på profilen:**
> 🎖 Level 8 — Intimate
> 🏅 Smooth Talker · Good Listener · Comeback King

Signalerar till kvinnor: denna person har investerat i att bli en bättre kommunikatör.
Triggar andra män: "Han har 6 medaljer, jag har 2."

#### 5.5.5 Sexuell Hälsa & Utbildning (för alla)

**Ämnesområden:**

| Område | Exempel-topics | Målgrupp |
|--------|---------------|----------|
| **Kroppen** | Anatomi, erogenous zones, menscykeln och lust, erektionsproblem, orgasm | Alla |
| **Njutning** | Techniques, oral sex, massage, att hitta vad man gillar, kommunicera vad man vill | Alla |
| **Sexuell hälsa** | STI-prevention, testning, preventivmedel, fertilitetsmedvetenhet | Alla |
| **Mental hälsa & sex** | Prestationsångest, body image, sexual shame, trauma-awareness | Alla |
| **Relationer** | Svartsjuka, öppna relationer, polyamori, kommunikationsmodeller (NVC, Gottman) | Alla |
| **Kink & BDSM** | Safe practices, rope safety, impact play, consent-ramverk, aftercare, sub-drop | Spicy mode |
| **Par-utbildning** | Öppna upp relationen, svingerdebut, threesome-guide, jealousy management | Par |
| **LGBTQ+** | Queer sex ed, trans-specifika frågor, coming out, bi-synlighet | LGBTQ+ |
| **Åldrande & sex** | Klimakteriet och lust, medicinska förändringar, sex efter 50/60/70 | 45+ |

**Leveransformat per topic:**

| Format | Bäst för | Exempel |
|--------|---------|---------|
| AI-telefonsamtal | Snabb fråga, pinsamt att googla | "Är det normalt att jag...?" → 5 min samtal med AI-sexolog |
| AI-podcast | Djupdykning, lyssna under pendling | "Avsnitt: Hur öppna relationer faktiskt funkar" — två AI-röster diskuterar, baserat på Esther Perel + forskning |
| AI-videosamtal | Personlig coaching, följdfrågor | Session med AI-terapeut om prestationsångest |
| Interaktivt scenario | Övning | Par-övning: "Prata om en fantasy med din partner" med AI-feedback |
| Prefab video | Expert-content | Intervju med sexolog om menscykeln och lust |
| Artikel/guide | Referens | "Steg-för-steg: Rope bondage safety" med illustrationer |
| Quiz | Självinsikt | "Vilken attachment style har du?" |

**Inspiration-källor att prenumerera på/lära av:**
- Omgyes (tekniker, forskningsbaserat)
- Ersätt inte med kopia — gör vår egen version, AI-first, dynamisk
- Sexologer och terapeuter (svenska: RFSU, internationella: Emily Morse, Esther Perel)
- Forskningsdatabaser (PubMed, Kinsey Institute)

**Viktigt:** Vi är INTE en medicinsk tjänst. Tydlig disclaimer: "Detta är utbildning, inte medicinsk rådgivning. Kontakta 1177 eller din vårdgivare för medicinska frågor."

#### 5.5.6 Relationer & Kommunikation (för alla)

**Moduler:**

| Modul | Innehåll | Format |
|-------|----------|--------|
| Kommunikation 101 | Aktiv lyssning, jag-budskap, icke-våldsam kommunikation | AI-scenario + artikel |
| Konflikhantering | Gottman-metoden, repair attempts, de-eskalering | AI-scenario |
| Svartsjuka | Förstå, hantera, kommunicera kring svartsjuka | AI-samtal + podcast |
| Öppna relationen | Steg-för-steg-guide för par som vill utforska | AI-podcast + par-övning |
| Polyamori | Praktisk guide: tidshantering, hierarchier, kitchen table vs parallel | AI-podcast |
| Boundaries | Sätta, kommunicera och upprätthålla gränser | AI-coaching |
| Attachment styles | Förstå din och partnerns anknytningsstil | Quiz + AI-förklaring |
| After breakup | Hantera separation, gå vidare, inte bli bitter | AI-samtal |

---

### 5.6 PELARE 6: SHOP

#### 5.6.1 Marknadsplats (P2P)

**Vad kan säljas:**
- Begagnade underkläder och kläder
- Sexleksaker
- Fetisch-artiklar
- Handgjorda produkter
- Konst och fotografi

**Vad kan INTE säljas:**
- Sexuella tjänster (olagligt)
- Droger eller läkemedel
- Vapen
- Material som avbildar minderåriga

**Betalningsflöde (anonymt):**
1. Köpare swishar till plattformens Swish-nummer
2. Plattformen håller pengarna (escrow)
3. Säljare levererar
4. Köpare bekräftar (eller auto-bekräftelse efter 7 dagar)
5. Plattformen swishar ut till säljare
6. Ingen part ser den andras namn — bara "AppNamn AB"

**Provision:** 10-15%

#### 5.6.2 Business Webshops

Företag får en komplett webshop i appen:
- Produktkatalog, bilder, priser
- Betalning via plattformens Swish (anonymt för köparen)
- Orderhantering, chat med kunder
- Analytics
- Fraktintegration
- Annonsverktyg

Prissättning: engångsverifiering (500 SEK) + provision (10-15%) + annonsering (CPM/CPC)

#### 5.6.3 Annonsplattform

**Annonsörer:**
- Sexleksaksbutiker, underklädesföretag, swingersklubbar, kondomtillverkare, dating-coacher, hotell/resorts, hälsotjänster

**Format:**
- Native feed-annonser
- Event-sponsring
- Stories-annonser
- Marknadsplats-highlights

**Targeting — vår superpower:**
Vi har data som Facebook aldrig har: sexuell läggning, kinks, relationstyp, vad personen söker. En sexleksaksbutik kan rikta mot "kvinnor 25-40 i Stockholm intresserade av BDSM."

**Självbetjäningsportal:**
- Skapa konto, välj budget/målgrupp/format
- Ladda upp content, se analytics
- Betala via faktura eller Swish

---

## 6. Betalningsmodell

### 6.1 Grundprincip: Pay-as-you-go med osynlig betalning

Ingen prenumeration. Ingen "Premium" eller "Pro". Användaren betalar för vad hen använder, och ser aldrig tal om pengar inne i appen.

### 6.2 Token-modell

Alla kostnader uttrycks internt i tokens. 1 token ≠ 1 krona — det är en abstrakt enhet.

**Bakom kulisserna:**
- Vi köper AI-tokens, hosting, bandwidth till vår kostnad
- Vi lägger på en dynamisk spread (default ~3x, justerbar per marknad/segment/säsong)
- Spread lagras med 5 decimaler
- Spread kan justeras utan att ändra UI

Exempel:
```
Claude API-kostnad: 0.00312 SEK för en Gatekeeper-konversation
Spread: 3.2x
Användaren debiteras: 0.00998 SEK
(Visas aldrig i appen)
```

**Dynamisk spread:**
- Nya användare: lägre spread (locka in)
- Norska användare: högre spread (högre betalningsvilja)
- Hög belastning: kan höjas marginellt
- A/B-testbar utan UI-förändring

### 6.3 Användarupplevelse

**Registrering:**
1. Swish-verifiering (10 SEK, gratis för kvinnor i kampanjer)
2. Lägg in kort, välj auto-topup-nivå (default: "Fyll på 100 SEK när saldot understiger 20 SEK")
3. Klart.

**I appen:**
- INGA priser visas. Aldrig.
- "Kontakta Lisa" — inte "Kontakta Lisa (2 SEK)"
- "Starta coaching" — inte "Session (15 SEK)"
- "Spela in" — inte "Inspelning 5 SEK/GB"
- Appen bara fungerar. Tokens dras i bakgrunden.
- Auto-topup triggas när saldot sjunker under vald nivå

**Separat betalningssida (utanför appen):**
- URL: typ pay.appnamn.se
- Logga in med kod från appen
- Se: saldo, topup-historik, dagliga sammanställningar ("2026-03-24: 847 tokens ≈ 12.43 SEK")
- Justera auto-topup-nivå
- Byta kort
- Ladda ner kvitton/fakturor
- INTE synligt inne i appen

### 6.4 Vad som kostar tokens

| Funktion | Token-kostnad (ungefär) | Notering |
|----------|------------------------|----------|
| AI Gatekeeper (för avsändaren) | ~2 SEK per kontakt | Mottagaren betalar ALDRIG |
| AI Coach-session | ~10-20 SEK per 15 min | Beroende på video/röst/text |
| AI-podcast (genererad) | ~5-10 SEK per episod | On-demand content |
| AI-telefonsamtal | ~1-2 SEK/min | Snabba frågor |
| Videochat | ~0.50 SEK/min | WebRTC |
| ConsentVault lagring | ~5 SEK/GB/mån | Kontinuerlig kostnad |
| Boost | ~29 SEK per 24h | Synlighet |
| Feed-browsing, chat, sökning | Gratis | Kärnfunktionalitet |
| SafeDate | Gratis | Säkerhet |
| Events (delta) | Gratis (+ ev biljett) | Biljetter har synligt pris i SEK |

### 6.5 Vad med synliga priser i SEK

Undantag där priser visas i riktiga kronor:
- Marknadsplats-produkter (säljaren sätter pris)
- Event-biljetter (arrangören sätter pris)
- Business-verifiering (500 SEK engång)
- Auto-topup-belopp (på betalningssidan, inte i appen)

### 6.6 Gratis för kvinnor?

Diskussionspunkt: Ska kvinnor betala tokens alls? Alternativ:

**Option A:** Kvinnor betalar som alla andra men har generöst gratis-saldo (tex 500 SEK worth of tokens vid registrering). Behöver aldrig toppa på om de inte är power users.

**Option B:** Kvinnor betalar aldrig. Allt är gratis. Deras tokens subsidieras av annonsintäkter och mäns betalningar.

**Option C:** Alla betalar lika men AI Gatekeeper-kostnaden betalas alltid av avsändaren (den som vill ta kontakt). Eftersom män initierar oftare betalar de mer naturligt.

Rekommendation: **Option C** — rättvist, icke-diskriminerande, och den naturliga beteende-asymmetrin gör att män betalar mer ändå.

### 6.7 Intäktsströmmar

| Ström | Beskrivning |
|-------|-------------|
| Token-spread | Alla AI-funktioner, hosting, video — vi tar spread på faktisk kostnad |
| Marknadsplats-provision | 10-15% per transaktion |
| Event-biljett-provision | 10% per biljett |
| Annonsering | CPM/CPC, self-serve för businesses |
| Business-verifiering | 500 SEK engång |
| Business shop-provision | 10-15% per försäljning |
| Boosts | ~29 SEK per 24h |

### 6.8 Revenue-uppskattning vid 100K användare

- Token-spread (AI, video, hosting): ~500K-1M SEK/mån
- Annonsering: ~200K-1M SEK/mån (beroende på annonsörs-adoption)
- Marknadsplats + events: ~100-300K SEK/mån
- Boosts: ~100-200K SEK/mån
- Business-plattform: ~50-200K SEK/mån
- **Total: ~1-3M SEK/mån vid 100K användare**

---

## 7. Go-to-Market

### 7.1 Fas 0: Pre-launch (3 månader före launch)

**Mål:** Bygga en databas av pre-registrerade kvinnor och par.

**Strategi: "Women First" launch**

1. **Landningssida** — "Kommande: en ny plattform designad för dig." Email-signup. Countdown.

2. **Annonsering på befintliga plattformar:**
   - Banners på BodyContact, Knullkontakt och liknande sajter
   - Google Ads: "sexdejting", "swingers Sverige", "knullkontakt"
   - Flashback-sektioner

3. **Social media:**
   - Instagram/TikTok riktad mot 25-45 kvinnor
   - "Tröttnat på oönskade dick pics? Vi bygger en app där DU bestämmer vem som får kontakta dig."
   - Sexpositivta influencers och podcasts

4. **PR:**
   - "Svensk startup utmanar BodyContact med AI-driven trygghet"
   - AI-vinkel + kvinnors säkerhet + svensk tech

5. **Erbjudande:**
   - "Första 1000 kvinnor: livstids gratis-tokens (X SEK worth)"
   - "Första 500 par: 1 år gratis-tokens"
   - FOMO + garanterad bas av kvinnliga profiler

6. **One-click migration:**
   - "Har du profil på BodyContact? Ange ditt användarnamn → vi importerar din publika profiltext och bilder"
   - Scraping av publikt tillgängligt, med explicit samtycke

### 7.2 Fas 1: Launch (MVP)

- Invite-only första veckan (pre-registrerade)
- Sedan öppet
- Fokus: profiler, AI Gatekeeper, chat, grundläggande feed, SafeDate, AI Coach nivå 1-2
- Geografiskt: Sverige

### 7.3 Fas 2: Tillväxt (6-12 månader)

- Events, organisationer, marknadsplats, ConsentVault
- Learn-plattformen utbyggd
- Business webshops och annonsplattform
- Nordisk expansion: Norge, Danmark, Finland

### 7.4 Fas 3: Mognad (12-24 månader)

- International expansion (Tyskland, Nederländerna)
- Partnerskap: STD-testning (1177/apotek), swingersklubbar
- Avancerad AI (beteendematchning, preferens-lärande)
- Creator-ekonomi (noggrant granskat mot 2025-lagen)

---

## 8. Regulatorisk analys

### 8.1 Relevanta lagar

| Lag | Relevans | Vår hantering |
|-----|----------|---------------|
| GDPR | All persondata, "special category" (sexuell läggning) | Explicit consent, kryptering, DPO, Privacy by Design |
| Sexköpslagen (BrB 6:11) | Vi får inte facilitera köp av sex | Tydliga regler, moderation, marknadsplats säljer varor |
| Ny lag 2025-07-01 | Köp av sexuella handlingar online = olagligt | Videochat = kommunikation, inte tjänst. Marknadsplats = varor. Creator-ekonomi granskas noggrant |
| Hämnporrlagen (BrB 4:6c) | Spridning av intima bilder utan samtycke | ConsentVault löser proaktivt |
| Marknadsföringslagen | Opt-in krävs | Compliance |
| Distanshandelslagen | Marknadsplats-transaktioner | 14 dagars ångerrätt, tydliga villkor |
| Bokföringslagen | 7 år betalningsdata | Lagring |
| PSD2 | Vi håller INTE pengar (Swish genomströmning) | Fas 1: inget tillstånd behövs |

### 8.2 GDPR-specifikt

- Sexuell läggning = "special category data" (Art. 9) → explicit consent
- DPO krävs
- DPIA krävs före launch
- Anmälan till IMY

### 8.3 Åldersgräns

- 18+ verifierat via Swish + SPAR-register
- Tekniskt omöjligt att skapa konto utan verifierad ålder

---

## 9. Framgångsmått (KPIs)

### 9.1 Launch (6 månader)

| KPI | Mål |
|-----|-----|
| Pre-registrerade kvinnor | 2 000 |
| Pre-registrerade par | 500 |
| Totala registreringar | 25 000 |
| Könsbalans | Max 60% män / min 20% kvinnor |
| DAU/MAU | >30% |
| AI Gatekeeper genomsläppning | 40-60% |
| SafeDate-aktiveringar/vecka | >100 |
| AI Coach-sessioner/vecka | >500 |
| NPS bland kvinnor | >50 |

### 9.2 Tillväxt (6-24 månader)

| KPI | Mål |
|-----|-----|
| Totala registreringar | 100 000 |
| MRR | 1.5M SEK |
| Events/månad | 200 |
| Organisationer | 50 |
| Marknadsplats-transaktioner/mån | 1 000 |
| Retention 30d | >40% |
| AI Coach completion rate (nivå 1-10) | >20% |

---

## 10. Risker

| Risk | Sannolikhet | Impact | Mitigering |
|------|------------|--------|-----------|
| Kan inte attrahera tillräckligt många kvinnor | Hög | Kritisk | Women-first launch, AI Gatekeeper som USP, SafeDate |
| Regulatorisk utmaning (2025-lagen) | Medium | Hög | Juridisk granskning, tydlig avgränsning |
| Betalningsprocessor (high-risk merchant) | Medium | Hög | Swish primär, förhandla tidigt |
| Säkerhetsincident/dataläcka | Låg | Kritisk | Security-first, pentesting, bug bounty |
| App Store-rejection (explicit content) | Medium | Hög | Default vanilla mode, 17+ rating, PWA backup |
| AI Coach-content missuppfattas som "pickup" | Medium | Medium | Tydlig filosofi, evidensbaserat, pr-strategi |
| ConsentVault juridisk komplexitet | Medium | Medium | Juridisk granskning, tydliga villkor |
| Scalability AI-kostnader | Medium | Medium | Dynamisk spread justerar automatiskt |

---

## 11. Open Questions

1. **Namn** — behöver beslut. Favoriter: Lume, Blossa, Pulse, Noa
2. **App Store-strategi** — Apple/Googles policies. PWA-backup?
3. **112/SOS-integration** — partnerskap med SOS Alarm?
4. **AI-modeller** — eget fine-tunat eller API? Latency? Kostnad?
5. **Juridisk struktur** — AB, tillstånd, DPO
6. **Content-partnerskap** — Omgyes-licens? RFSU-samarbete?
7. **Funding** — bootstrapped eller seed?
8. **Namn på AI Coach och AI övningspartner** — personligheter, namn, utseende
9. **Moderationsteam vid launch** — AI + hur många manuella?
10. **STD-testning-partnerskap** — 1177? Apotek? Hemtest-företag?

---

## 12. Framtidsvisioner

- **VR-rum** — virtuella mötesplatser
- **AI-terapeut** — anonymt prata om sexuella funderingar (inte ersättning för riktig terapi)
- **Par-verktyg** — gemensam wishlist, kommunikationsverktyg
- **Mentorskap** — erfarna lifestyle-deltagare mentorar nybörjare
- **STD-integration** — boka test, dela status med partners
- **Internationalisering** — Tyskland, Nederländerna, Spanien
- **AI Coaching för kvinnor** — kommunikation, njutning, gränssättning
- **AI Coaching för par** — gemensamma sessioner, kommunikationsövningar

---

## Appendix A: Konkurrentdata

Se: `~/bodycontact-recon/COMPETITIVE-ANALYSIS.md`

## Appendix B: BodyContact-crawl

87 HTML-filer i `~/bodycontact-recon/`

## Appendix C: Marknadsdata

- Svensk dejtingmarknad: $39.82M (2025)
- 1.4M aktiva dejtingapp-användare
- Tinder: 208K aktiva, $666K/vecka revenue
- Hinge: 90K→101K, snabbast växande
- BodyContact: 265K registrerade, 6K online
- C-Date: 450K svenska
- Diversia: 150K
- AFF: 350K svenska
- Feeld: försumbart i Sverige

---

*Version 2.0 — uppdaterad med pay-as-you-go-modell, Vanilla ↔ Spicy toggle, AI Dating Coach med gamification, sexuell hälsa/utbildningsplattform, business webshops, annonsplattform och dynamisk token-modell.*

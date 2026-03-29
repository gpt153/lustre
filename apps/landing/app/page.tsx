'use client'

import { useState, useCallback, useEffect } from 'react'
import './landing.css'
import { WaitlistForm } from './waitlist-form'
import { ScrollReveal } from './scroll-reveal'
import { ModeToggle } from './mode-toggle'
import { Countdown } from './countdown'

type Mode = 'vanilla' | 'spicy'

/* ═══════════════════════════════════════
   CONTENT — Vanilla vs Spicy
   ═══════════════════════════════════════ */

const content = {
  vanilla: {
    tagline: 'Never lack Lustre.',
    heroTitle: 'Dejting, community och mer',
    heroGradient: '\u2014 allt i en app.',
    heroSubtitle:
      'En plattform där varje meddelande \u00e4r relevant, varje m\u00f6te \u00e4r tryggt, och ingen beh\u00f6ver sk\u00e4mmas f\u00f6r vad de vill ha.',

    problems: [
      {
        number: '200',
        text: 'meddelanden. 3 relevanta.',
        subtext: 'Du f\u00f6rtj\u00e4nar b\u00e4ttre \u00e4n att gr\u00e4va efter n\u00e5len i h\u00f6stacken.',
      },
      {
        number: '0',
        text: 'verifierade. Alla anonyma.',
        subtext: 'Vi v\u00e4nde p\u00e5 det. Alla verifierade. Helt anonyma.',
      },
      {
        number: '5',
        text: 'appar. Noll sammanhang.',
        subtext: 'En f\u00f6r dejting. En f\u00f6r kink. En f\u00f6r events. En f\u00f6r community. Ingen som g\u00f6r allt.',
      },
    ],

    solutionsTitle: 'Byggt annorlunda.',
    solutionsSubtitle: 'Inte ytterligare en dejtingapp. En helt ny typ av plattform.',
    solutions: [
      {
        icon: 'filter',
        title: 'Intelligent filtrering',
        text: 'Bara meddelanden från personer som faktiskt matchar vad du söker. Ingen spam. Ingen "hej vill du knulla" om du inte bett om det.',
      },
      {
        icon: 'verify',
        title: 'Verifierad, men anonym',
        text: 'Alla är verifierade vuxna. Ingen ser ditt riktiga namn. Någonsin. Om någon beter sig illa kan de ställas till svars.',
      },
      {
        icon: 'safe',
        title: 'Säkerhet inbyggd',
        text: 'Verktyg för trygga möten, skyddad delning, och fullständig kontroll över ditt innehåll. Gratis. Alltid.',
      },
      {
        icon: 'learn',
        title: 'Från nyfiken till erfaren',
        text: 'Lär dig kommunicera, utforska och njuta \u2014 med stöd av AI, inte YouTube-guruer.',
      },
    ],

    pillarsLabel: 'Mer än dejting',
    pillarsTitle: 'Ett helt ekosystem.',
    pillarsSubtitle:
      'Dejting är bara början. Lustre är ett socialt nätverk, en mötesplats, en kunskapsplattform och en marknadsplats \u2014 allt i en app.',
    pillars: [
      {
        title: 'Social feed',
        text: 'Dela tankar, bilder och stunder. Följ personer du gillar. Upptäck nytt genom en feed som lär sig vad du vill se \u2014 och vad du inte vill se. Du styr, inte algoritmen.',
      },
      {
        title: 'Events & träffar',
        text: 'Hitta och skapa events \u2014 online eller IRL. Workshops, fester, munchar, after works. Bara matchande profiler ser dina event. Biljettförsäljning inbyggd.',
      },
      {
        title: 'Grupper & community',
        text: 'Intressegrupper kring allt från tantra till polyamori. Öppna eller privata. Egna diskussioner, egna events, egna regler. Hitta din flock.',
      },
      {
        title: 'Organisationer & klubbar',
        text: 'Swingersklubbar, föreningar och arrangörer får en verifierad profil med eventhantering, medlemslista och nyhetsbrev. Ett riktigt hem för er community.',
      },
      {
        title: 'Butiker & marknadsplats',
        text: 'Sexleksaker, underkläder, konst, böcker. Köp och sälj direkt i appen. Företag öppnar webshop, privatpersoner säljer mellan varandra. Diskret leverans, diskret betalning.',
      },
      {
        title: 'Video, röst & chat',
        text: 'Krypterad chatt, videosamtal, röstmeddelanden. Allt inbyggt. Inga tredjepartsappar, ingen risk att konversationen läcker. Meddelanden som försvinner, om du vill.',
      },
    ],

    dualLabel: 'Två sidor',
    dualTitle: 'En app. Ditt val.',
    dualText:
      'Ibland vill du dejta vanligt. Ibland vill du utforska mer. Lustre anpassar sig efter dig \u2014 inte tvärtom. Samma app, helt olika upplevelser.',

    audienceTitle: 'För alla som vill mer.',
    audience: [
      { emoji: '\u{1F46B}', title: 'Par', text: 'Utforska tillsammans. Hitta andra par, skapa en gemensam profil, gå på events ihop.' },
      { emoji: '\u2728', title: 'Nyfikna', text: 'Vill du bara dejta "vanligt" med bättre verktyg? Perfekt. Vill du utforska mer? Det finns här när du är redo.' },
      { emoji: '\u{1F308}', title: 'LGBTQ+', text: 'Alla läggningar, identiteter och uttryck. Pronomen, icke-binärt, poly \u2014 inte en eftertanke utan inbyggt från dag ett.' },
      { emoji: '\u{1F3AD}', title: 'Kink & BDSM', text: 'Tagga dina intressen, hitta likasinnade, gå med i grupper. Utan att ditt vanliga dejtingläge avslöjar något du inte vill.' },
      { emoji: '\u{1F3AA}', title: 'Arrangörer', text: 'Driver du klubb, förening eller event? Få verifierad profil, sälj biljetter, nå exakt rätt publik.' },
      { emoji: '\u{1F6CD}\uFE0F', title: 'Företag', text: 'Sexleksaksbutiker, underklädesföretag, hälsotjänster \u2014 öppna butik direkt i appen och nå en engagerad publik.' },
    ],

    waitlistTitle: 'Vi bygger något nytt.',
    waitlistText: 'Var med från början och forma plattformen du alltid velat ha.',
    waitlistBadge: 'Begränsad tidig tillgång',
  },

  spicy: {
    tagline: 'Never lack Lustre.',
    heroTitle: 'Sluta g\u00f6mma halva dig.',
    heroGradient: 'Hela du \u00e4r v\u00e4lkommen.',
    heroSubtitle:
      'En plattform f\u00f6r dig som vet vad du vill \u2014 och vill hitta andra som vill samma sak. Utan urs\u00e4kter. Utan skam. Med fullst\u00e4ndig kontroll.',

    problems: [
      {
        number: '\u221E',
        text: 'st\u00e4llen att g\u00f6mma sig. Noll att vara \u00f6ppen.',
        subtext: 'Feeld har knappt anv\u00e4ndare i Sverige. FetLife \u00e4r d\u00f6tt. Du f\u00f6rtj\u00e4nar en riktig plattform.',
      },
      {
        number: '75%',
        text: 'm\u00e4n p\u00e5 varje plattform. Kvinnor l\u00e4mnar.',
        subtext: 'Inte f\u00f6r att intresset saknas. F\u00f6r att upplevelsen \u00e4r skit.',
      },
      {
        number: '0',
        text: 'plattformar som tar consent p\u00e5 allvar.',
        subtext: 'Vi byggde consent-verktyg som skyddar er b\u00e5da. Inte bara i chatten \u2014 i sovrummet.',
      },
    ],

    solutionsTitle: 'Byggt för dig som vågar.',
    solutionsSubtitle: 'Inte ytterligare en app som kräver att du tonar ner dig.',
    solutions: [
      {
        icon: 'filter',
        title: 'Matchning som förstår dig',
        text: 'Tagga dina kinks, dina gränser, dina fantasier. Vår matchning förstår skillnaden mellan nyfiken och erfaren, mellan dom och switch.',
      },
      {
        icon: 'verify',
        title: 'Anonymt, men spårbart',
        text: 'Ditt riktiga namn syns aldrig. Men alla är verifierade \u2014 och om någon bryter mot consent finns det konsekvenser.',
      },
      {
        icon: 'safe',
        title: 'Consent som funkar på riktigt',
        text: 'Dela intimt material utan risk för hämnporr. Inspelning med ömsesidigt samtycke, DRM-skydd, revoke med ett klick. Säkerhet för fysiska möten, gratis.',
      },
      {
        icon: 'learn',
        title: 'Lär dig, utforska, utvecklas',
        text: 'Personlig coaching i kommunikation, gränser, kink-safety och fysisk intimitet. Rollspel, dirty talk, aftercare \u2014 allt du aldrig fick lära dig.',
      },
    ],

    pillarsLabel: 'Din värld',
    pillarsTitle: 'Allt du behöver. Äntligen.',
    pillarsSubtitle:
      'Sluta sprida ditt liv över fem plattformar. Dejting, community, events, marknadsplats och utbildning \u2014 allt samlas här.',
    pillars: [
      {
        title: 'Feed utan censur',
        text: 'Dela vad du vill \u2014 stämningar, fantasier, vardagliga tankar. Intelligent klassificering låter dig styra exakt vad du ser. Ingen ofrivillig dick pic. Allt du vill, inget du inte vill.',
      },
      {
        title: 'Events som betyder något',
        text: 'Spelkvällar, workshops i repkonst, swingerfester, kinkfika. Skapa events riktade till exakt rätt publik. Diskretion inbyggd \u2014 bara matchande profiler ser.',
      },
      {
        title: 'Ditt community',
        text: 'Grupper för rope bunnies, dom/sub-diskussioner, polyamorösa delar erfarenheter. Öppna eller slutna. Modererande av er, för er. En plats som är er.',
      },
      {
        title: 'Klubbar & föreningar',
        text: 'Swingersklubbar, BDSM-föreningar, tantragrupper \u2014 verifierade profiler med eventhantering, gästlistor, biljettförsäljning. Nå er community direkt.',
      },
      {
        title: 'Marknadsplats',
        text: 'Leksaker, kläder, bondage-rep, konst, handgjort. Företag och privatpersoner säljer direkt i appen. Diskret leverans, diskret betalning.',
      },
      {
        title: 'Krypterat. Allt.',
        text: 'End-to-end-krypterad chatt. Videosamtal med bakgrundsblurrning. Efemära meddelanden. Screenshot-blockering. Din konversation stannar mellan er.',
      },
    ],

    dualLabel: 'Du är här',
    dualTitle: 'Välkommen till spicy-sidan.',
    dualText:
      'Det här är läget där du kan vara helt öppen. Dina kinks, dina intressen, dina begär \u2014 synliga för dem som delar dem. Och när du vill visa appen för mamma? Ett klick tillbaka till vanilla.',

    audienceTitle: 'Oavsett vad du är inne på.',
    audience: [
      { emoji: '\u{1F525}', title: 'Par som utforskar', text: 'Soft swap, full swap, trekanter, MFM, FMF \u2014 skapa en parprofil och hitta andra par eller enskilda som matchar vad ni söker.' },
      { emoji: '\u26D3\uFE0F', title: 'BDSM & kink', text: 'Dom, sub, switch, rigger, rope bunny, primal, pet play \u2014 tagga dina intressen granulert. Nyfiken, gillar, eller älskar.' },
      { emoji: '\u{1F49C}', title: 'Poly & ENM', text: 'Öppna relationer, relationsanarkister, triader, konstellationer. Länka upp till 5 profiler. Ert förhållande, era regler.' },
      { emoji: '\u{1F308}', title: 'Queera rum', text: 'Inte en eftertanke. Lustre är byggt queer-inklusivt från grunden. Alla läggningar, alla identiteter, alla uttryck.' },
      { emoji: '\u{1F3AD}', title: 'Eventarrangörer', text: 'Workshops, dungeon nights, fester, munchar. Skapa, marknadsför och sälj biljetter. Nå rätt publik utan att kompromissa.' },
      { emoji: '\u{1F48E}', title: 'Butiker & kreatörer', text: 'Sälj leksaker, harness, bondage-rep, underkläder, konst. Inbyggd webshop med diskret betalning. Nå en publik som faktiskt vill köpa.' },
    ],

    waitlistTitle: 'Äntligen en plattform som förstår.',
    waitlistText: 'Vi bygger det du alltid saknat. Var med från början.',
    waitlistBadge: 'Tidig tillgång \u2014 begränsade platser',
  },
} as const

/* ═══════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════ */

const icons = {
  filter: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  verify: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  safe: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  learn: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
}

const iconColors = ['filter', 'verify', 'safe', 'learn'] as const

/* ═══════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════ */

export default function LandingPage() {
  const [mode, setMode] = useState<Mode>('vanilla')
  const [hideSticky, setHideSticky] = useState(false)
  const isSpicy = mode === 'spicy'

  const c = content[mode]

  const handleToggle = useCallback((newMode: Mode) => {
    setMode(newMode)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      setHideSticky(scrollPercent > 0.55)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`landing-page ${isSpicy ? 'landing-page--spicy' : ''}`}>
      {/* Ambient background orbs */}
      <div className="ambient-bg">
        <div className="ambient-orb ambient-orb--warm" />
        <div className="ambient-orb ambient-orb--rose" />
        <div className="ambient-orb ambient-orb--center" />
        <div className="ambient-orb ambient-orb--gold" />
      </div>

      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Sticky mode toggle */}
      <div className={`sticky-toggle ${hideSticky ? 'sticky-toggle--hidden' : ''}`}>
        <ModeToggle mode={mode} onToggle={handleToggle} />
      </div>

      <div className="landing-content">
        {/* ═══ HERO ═══ */}
        <section className="hero">
          <div className="hero__logo-container">
            <div className="hero__logo-glow" />
            <img src="/logo.png" alt="Lustre" className="hero__logo-img" />
          </div>

          <div className="hero__brand">LUSTRE</div>

          <div className="hero__tagline">{c.tagline}</div>

          <h1 className="hero__title" key={`title-${mode}`}>
            {c.heroTitle}{' '}
            <span className="hero__title-gradient">{c.heroGradient}</span>
          </h1>

          <p className="hero__subtitle" key={`sub-${mode}`}>
            {c.heroSubtitle}
          </p>

          <div className="hero__cta-area">
            <Countdown />
            <div style={{ marginTop: '32px' }}>
              <WaitlistForm mode={mode} />
            </div>
          </div>

          <div className="hero__scroll-hint">
            <div className="scroll-arrow" />
          </div>
        </section>

        {/* ═══ PROBLEMS ═══ */}
        <section className="problems" key={`problems-${mode}`}>
          {c.problems.map((p, i) => (
            <ScrollReveal key={`${mode}-problem-${i}`} className="problem-statement">
              <div className="problem-statement__number" data-reveal>{p.number}</div>
              <div className="problem-statement__text" data-reveal>{p.text}</div>
              <div className="problem-statement__subtext" data-reveal>{p.subtext}</div>
            </ScrollReveal>
          ))}
        </section>

        {/* ═══ SOLUTIONS ═══ */}
        <section className="solutions">
          <h2 className="solutions__title">{c.solutionsTitle}</h2>
          <p className="solutions__subtitle">{c.solutionsSubtitle}</p>

          <div className="solutions__grid">
            {c.solutions.map((s, i) => (
              <ScrollReveal key={`${mode}-sol-${i}`} className="solution-card">
                <div className={`solution-card__icon solution-card__icon--${iconColors[i]}`} data-reveal>
                  {icons[s.icon as keyof typeof icons]}
                </div>
                <h3 className="solution-card__title" data-reveal>{s.title}</h3>
                <p className="solution-card__text" data-reveal>{s.text}</p>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ═══ MORE THAN DATING ═══ */}
        <section className="pillars">
          <ScrollReveal>
            <div className="pillars__header" data-reveal>
              <div className="pillars__label">{c.pillarsLabel}</div>
              <h2 className="pillars__title">{c.pillarsTitle}</h2>
              <p className="pillars__subtitle">{c.pillarsSubtitle}</p>
            </div>
          </ScrollReveal>

          <div className="pillars__list">
            {c.pillars.map((p, i) => (
              <ScrollReveal key={`${mode}-pillar-${i}`} className="pillar">
                <div className="pillar__number" data-reveal>{String(i + 1).padStart(2, '0')}</div>
                <div className="pillar__content">
                  <h3 className="pillar__title" data-reveal>{p.title}</h3>
                  <p className="pillar__text" data-reveal>{p.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ═══ DUAL MODE ═══ */}
        <section className="dual-mode">
          <div className="dual-mode__container">
            <ScrollReveal>
              <div className="dual-mode__label" data-reveal>{c.dualLabel}</div>
              <h2 className="dual-mode__title" data-reveal>{c.dualTitle}</h2>
              <p className="dual-mode__text" data-reveal>{c.dualText}</p>
              <div className="dual-mode__inline-toggle" data-reveal>
                <ModeToggle mode={mode} onToggle={handleToggle} />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ FOR EVERYONE ═══ */}
        <section className="audience">
          <ScrollReveal>
            <h2 className="audience__title" data-reveal>{c.audienceTitle}</h2>
          </ScrollReveal>
          <div className="audience__grid">
            {c.audience.map((a, i) => (
              <ScrollReveal key={`${mode}-aud-${i}`} className="audience__card">
                <div className="audience__emoji" data-reveal>{a.emoji}</div>
                <h3 className="audience__card-title" data-reveal>{a.title}</h3>
                <p className="audience__card-text" data-reveal>{a.text}</p>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ═══ WAITLIST CTA ═══ */}
        <section className="waitlist">
          <h2 className="waitlist__title">{c.waitlistTitle}</h2>
          <p className="waitlist__text">{c.waitlistText}</p>
          <div>
            <span className="waitlist__counter">
              <span className="waitlist__counter-dot" />
              {c.waitlistBadge}
            </span>
          </div>
          <div className="waitlist__form-wrapper">
            <WaitlistForm mode={mode} />
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="footer">
          <img src="/logo.png" alt="Lustre" className="footer__logo-img" />
          <div className="footer__location">Stockholm, Sverige</div>
          <div className="footer__links">
            <a href="/privacy" className="footer__link">Integritetspolicy</a>
            <a href="/terms" className="footer__link">Villkor</a>
          </div>
        </footer>
      </div>
    </div>
  )
}

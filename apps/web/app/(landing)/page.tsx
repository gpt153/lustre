import './landing.css'
import { WaitlistForm } from './waitlist-form'
import { ScrollReveal } from './scroll-reveal'

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Ambient background orbs */}
      <div className="ambient-bg">
        <div className="ambient-orb ambient-orb--warm" />
        <div className="ambient-orb ambient-orb--rose" />
        <div className="ambient-orb ambient-orb--center" />
      </div>

      {/* Grain overlay */}
      <div className="grain-overlay" />

      <div className="landing-content">
        {/* ═══ HERO ═══ */}
        <section className="hero">
          <div className="hero__logo">Lustre</div>

          <h1 className="hero__title">
            Dejting designat för dig som{' '}
            <span className="hero__title-gradient">förtjänar bättre.</span>
          </h1>

          <p className="hero__subtitle">
            En plattform där varje meddelande är relevant, varje möte är tryggt,
            och ingen behöver skämmas för vad de vill ha.
          </p>

          <div className="hero__cta-area">
            <WaitlistForm />
          </div>

          <div className="hero__scroll-hint">
            <div className="scroll-arrow" />
          </div>
        </section>

        {/* ═══ PROBLEMS ═══ */}
        <section className="problems">
          <ScrollReveal className="problem-statement">
            <div className="problem-statement__number" data-reveal>200</div>
            <div className="problem-statement__text" data-reveal>
              meddelanden. 3 relevanta.
            </div>
            <div className="problem-statement__subtext" data-reveal>
              Du förtjänar bättre än att gräva efter nålen i höstacken.
            </div>
          </ScrollReveal>

          <ScrollReveal className="problem-statement">
            <div className="problem-statement__number" data-reveal>0</div>
            <div className="problem-statement__text" data-reveal>
              verifierade. Alla anonyma.
            </div>
            <div className="problem-statement__subtext" data-reveal>
              Vi vände på det. Alla verifierade. Helt anonyma.
            </div>
          </ScrollReveal>

          <ScrollReveal className="problem-statement">
            <div className="problem-statement__number" data-reveal>1998</div>
            <div className="problem-statement__text" data-reveal>
              Då byggdes plattformarna du använder idag.
            </div>
            <div className="problem-statement__subtext" data-reveal>
              Din telefon hade inte ens kamera då.
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ SOLUTIONS ═══ */}
        <section className="solutions">
          <h2 className="solutions__title">Byggt annorlunda.</h2>
          <p className="solutions__subtitle">
            Inte ytterligare en dejtingapp. En helt ny typ av plattform.
          </p>

          <div className="solutions__grid">
            <ScrollReveal className="solution-card">
              <div className="solution-card__icon solution-card__icon--filter" data-reveal>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </div>
              <h3 className="solution-card__title" data-reveal>Intelligent filtrering</h3>
              <p className="solution-card__text" data-reveal>
                Bara meddelanden från personer som faktiskt matchar vad du söker.
                Ingen spam. Ingen &quot;hej vill du knulla&quot; om du inte bett om det.
              </p>
            </ScrollReveal>

            <ScrollReveal className="solution-card">
              <div className="solution-card__icon solution-card__icon--verify" data-reveal>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <h3 className="solution-card__title" data-reveal>Verifierad, men anonym</h3>
              <p className="solution-card__text" data-reveal>
                Alla är verifierade vuxna. Ingen ser ditt riktiga namn. Någonsin.
                Om någon beter sig illa kan de ställas till svars.
              </p>
            </ScrollReveal>

            <ScrollReveal className="solution-card">
              <div className="solution-card__icon solution-card__icon--safe" data-reveal>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3 className="solution-card__title" data-reveal>Säkerhet inbyggd</h3>
              <p className="solution-card__text" data-reveal>
                Verktyg för trygga möten, skyddad delning, och fullständig kontroll
                över ditt innehåll. Gratis. Alltid.
              </p>
            </ScrollReveal>

            <ScrollReveal className="solution-card">
              <div className="solution-card__icon solution-card__icon--learn" data-reveal>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </div>
              <h3 className="solution-card__title" data-reveal>Från nyfiken till erfaren</h3>
              <p className="solution-card__text" data-reveal>
                Lär dig kommunicera, utforska och njuta &mdash; med stöd av AI,
                inte YouTube-guruer.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ MORE THAN DATING ═══ */}
        <section className="pillars">
          <ScrollReveal>
            <div className="pillars__header" data-reveal>
              <div className="pillars__label">Mer än dejting</div>
              <h2 className="pillars__title">Ett helt ekosystem.</h2>
              <p className="pillars__subtitle">
                Dejting är bara början. Lustre är ett socialt nätverk, en mötesplats,
                en kunskapsplattform och en marknadsplats &mdash; allt i en app.
              </p>
            </div>
          </ScrollReveal>

          <div className="pillars__list">
            <ScrollReveal className="pillar">
              <div className="pillar__number" data-reveal>01</div>
              <div className="pillar__content">
                <h3 className="pillar__title" data-reveal>Social feed</h3>
                <p className="pillar__text" data-reveal>
                  Dela tankar, bilder och stunder. Följ personer du gillar.
                  Upptäck nytt genom en feed som lär sig vad du vill se &mdash;
                  och vad du inte vill se. Du styr, inte algoritmen.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal className="pillar">
              <div className="pillar__number" data-reveal>02</div>
              <div className="pillar__content">
                <h3 className="pillar__title" data-reveal>Events &amp; träffar</h3>
                <p className="pillar__text" data-reveal>
                  Hitta och skapa events &mdash; online eller IRL. Workshops, fester,
                  munchar, after works. Bara matchande profiler ser dina event.
                  Biljettförsäljning inbyggd.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal className="pillar">
              <div className="pillar__number" data-reveal>03</div>
              <div className="pillar__content">
                <h3 className="pillar__title" data-reveal>Grupper &amp; community</h3>
                <p className="pillar__text" data-reveal>
                  Intressegrupper kring allt från tantra till polyamori.
                  Öppna eller privata. Egna diskussioner, egna events, egna regler.
                  Hitta din flock.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal className="pillar">
              <div className="pillar__number" data-reveal>04</div>
              <div className="pillar__content">
                <h3 className="pillar__title" data-reveal>Organisationer &amp; klubbar</h3>
                <p className="pillar__text" data-reveal>
                  Swingersklubbar, föreningar och arrangörer får en verifierad
                  profil med eventhantering, medlemslista och nyhetsbrev.
                  En riktigt hem för er community.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal className="pillar">
              <div className="pillar__number" data-reveal>05</div>
              <div className="pillar__content">
                <h3 className="pillar__title" data-reveal>Butiker &amp; marknadsplats</h3>
                <p className="pillar__text" data-reveal>
                  Sexleksaker, underkläder, konst, böcker. Köp och sälj direkt i appen.
                  Företag öppnar webshop, privatpersoner säljer mellan varandra.
                  Diskret leverans, diskret betalning.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal className="pillar">
              <div className="pillar__number" data-reveal>06</div>
              <div className="pillar__content">
                <h3 className="pillar__title" data-reveal>Video, röst &amp; chat</h3>
                <p className="pillar__text" data-reveal>
                  Krypterad chatt, videosamtal, röstmeddelanden. Allt inbyggt.
                  Inga tredjepartsappar, ingen risk att konversationen läcker.
                  Meddelanden som försvinner, om du vill.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ DUAL MODE ═══ */}
        <section className="dual-mode">
          <div className="dual-mode__container">
            <ScrollReveal>
              <div className="dual-mode__label" data-reveal>Två sidor</div>
              <h2 className="dual-mode__title" data-reveal>En app. Ditt val.</h2>
              <p className="dual-mode__text" data-reveal>
                Ibland vill du dejta vanligt. Ibland vill du utforska mer.
                Lustre anpassar sig efter dig &mdash; inte tvärtom.
                Samma app, helt olika upplevelser.
              </p>
              <div className="dual-mode__toggle" data-reveal>
                <span className="dual-mode__toggle-option dual-mode__toggle-option--vanilla">
                  Vanilla
                </span>
                <span className="dual-mode__toggle-option dual-mode__toggle-option--spicy">
                  Spicy
                </span>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ FOR EVERYONE ═══ */}
        <section className="audience">
          <ScrollReveal>
            <h2 className="audience__title" data-reveal>
              För alla som vill mer.
            </h2>
          </ScrollReveal>
          <div className="audience__grid">
            <ScrollReveal className="audience__card">
              <div className="audience__emoji" data-reveal>&#x1F46B;</div>
              <h3 className="audience__card-title" data-reveal>Par</h3>
              <p className="audience__card-text" data-reveal>
                Utforska tillsammans. Hitta andra par, skapa en gemensam profil,
                gå på events ihop.
              </p>
            </ScrollReveal>
            <ScrollReveal className="audience__card">
              <div className="audience__emoji" data-reveal>&#x2728;</div>
              <h3 className="audience__card-title" data-reveal>Nyfikna</h3>
              <p className="audience__card-text" data-reveal>
                Vill du bara dejta &quot;vanligt&quot; med bättre verktyg? Perfekt.
                Vill du utforska mer? Det finns här när du är redo.
              </p>
            </ScrollReveal>
            <ScrollReveal className="audience__card">
              <div className="audience__emoji" data-reveal>&#x1F308;</div>
              <h3 className="audience__card-title" data-reveal>LGBTQ+</h3>
              <p className="audience__card-text" data-reveal>
                Alla läggningar, identiteter och uttryck. Pronomen, icke-binärt,
                poly &mdash; inte en eftertanke utan inbyggt från dag ett.
              </p>
            </ScrollReveal>
            <ScrollReveal className="audience__card">
              <div className="audience__emoji" data-reveal>&#x1F3AD;</div>
              <h3 className="audience__card-title" data-reveal>Kink &amp; BDSM</h3>
              <p className="audience__card-text" data-reveal>
                Tagga dina intressen, hitta likasinnade, gå med i grupper.
                Utan att ditt vanliga dejtingläge avslöjar något du inte vill.
              </p>
            </ScrollReveal>
            <ScrollReveal className="audience__card">
              <div className="audience__emoji" data-reveal>&#x1F3AA;</div>
              <h3 className="audience__card-title" data-reveal>Arrangörer</h3>
              <p className="audience__card-text" data-reveal>
                Driver du klubb, förening eller event? Få verifierad profil,
                sälj biljetter, nå exakt rätt publik.
              </p>
            </ScrollReveal>
            <ScrollReveal className="audience__card">
              <div className="audience__emoji" data-reveal>&#x1F6CD;&#xFE0F;</div>
              <h3 className="audience__card-title" data-reveal>Företag</h3>
              <p className="audience__card-text" data-reveal>
                Sexleksaksbutiker, underklädesföretag, hälsotjänster &mdash;
                öppna butik direkt i appen och nå en engagerad publik.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ WAITLIST CTA ═══ */}
        <section className="waitlist">
          <h2 className="waitlist__title">
            Vi bygger något nytt.
          </h2>
          <p className="waitlist__text">
            Var med från början och forma plattformen du alltid velat ha.
          </p>
          <div>
            <span className="waitlist__counter">
              <span className="waitlist__counter-dot" />
              Begränsad tidig tillgång
            </span>
          </div>
          <div className="waitlist__form-wrapper">
            <WaitlistForm />
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="footer">
          <div className="footer__logo">LUSTRE</div>
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

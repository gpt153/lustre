# Business Infrastructure Research — Lustre (Swedish Adult Dating Platform)
**Date:** 2026-03-24
**Status:** RESEARCH ONLY

---

## 1. Swish Integration for Business

### Swish Handel (Merchant) API

**Official documentation:** https://developer.swish.nu/
**API versions:** v1 APIs decommissioned 2026-02-03. All new integrations must use v2.

#### Integration Requirements
- Requires a **Swish Handel agreement** with a Swedish bank (Swedbank, SEB, Nordea, Handelsbanken, Danske Bank, Lansforsakringar, ICA Banken, Svea Bank, Northmill, Sparbanken Syd, Marginalen Bank)
- Uses **PKI-based TLS client certificates** for authentication
- Can integrate directly or via a **Technical Supplier (partner)**
- Test environment available via Merchant Swish Simulator (MSS): https://developer.swish.nu/api/mss

#### Three Separate APIs

1. **Commerce API** (payments in) — Payment requests + refunds
   - E-commerce flow: merchant creates payment request, user confirms in Swish app
   - M-commerce flow: opens Swish app directly on user's phone
   - Endpoint: `POST /api/v2/paymentrequests`
   - Callback URL receives payment status updates

2. **Payout API** (payments out) — Merchant to individual disbursements
   - Requires: `payeeAlias` (recipient phone number), `payeeSSN` (recipient personnummer), `amount`, `currency` (SEK)
   - Can send money to any Swish-connected phone number
   - **Useful for: marketplace seller payouts**

3. **Recurring Payments API** — NEW (previously not supported)
   - Documentation exists at: https://developer.swish.nu/api/recurring-payments
   - Guide: https://developer.swish.nu/documentation/guides/recurring-payments
   - This appears to be a newer addition — earlier docs stated "recurring payments not supported"
   - **Potentially usable for auto-topup**

#### Data Returned About Payer
- `payerAlias` — phone number (e.g., 46712345678)
- `payerPersonalNumber` — can be sent in request; Swish validates that it matches the registered owner of payerAlias
- `paymentReference` — bank reference
- `amount`, `currency`, `status`, `dateCreated`, `datePaid`
- **Swish does NOT return the payer's name in the API response** — only phone number
- The personnummer can be used as INPUT for validation but is not returned as output

#### Use Cases for Lustre
| Use Case | Feasible? | Notes |
|----------|-----------|-------|
| Registration fee / verification | YES | One-time payment confirms real Swedish phone + Swish account |
| Token/credit purchase | YES | Standard e-commerce payment |
| Marketplace escrow | PARTIAL | Can collect via Commerce API, hold, then pay out via Payout API. Not true escrow — you hold the money. |
| Payouts to sellers | YES | Payout API sends to phone number + requires personnummer |
| Recurring/auto-topup | MAYBE | New recurring API exists but needs investigation |
| Age verification via Swish | NO | Swish confirms identity (phone+personnummer match) but does not return age/DOB |

#### Costs
- Transaction fees set by your bank agreement (typically 1.5-3 SEK per transaction for Swish Handel)
- No monthly fee from Swish itself (bank may charge)
- Payout API fees vary by bank

#### SDKs & Libraries
- **Node.js:** https://github.com/monkybrain/swish-payment (npm: swish-payment)
- **C#/.NET:** https://github.com/RickardPettersson/swish-api-csharp
- **Via payment platforms:** Stripe supports Swish (https://docs.stripe.com/payments/swish), Adyen supports Swish, Nexi/Nets supports Swish

---

## 2. SPAR Register (Swedish Population Register) Lookup

### What is SPAR?
Statens personadressregister — Sweden's national population address register. Updated daily from Skatteverket. Contains all persons registered as resident in Sweden.

**Official site:** https://www.statenspersonadressregister.se/

### Roaring.io — Primary API Provider

**Website:** https://www.roaring.io/
**Developer portal:** https://developer.roaring.io/
**Docs:** https://docs.roaring.io/

#### What Roaring Returns (Population Register)
- Full name (first name, last name)
- Address (street, postal code, city)
- Birth date (birthDate, birthCongregation, birthCountyCode)
- Gender/sex
- Swedish citizenship status
- Whether person is deceased
- Relationship information
- Population registration status

#### Age Verification Flow
1. User provides phone number (from Swish) or personnummer
2. Query Roaring API with personnummer
3. Roaring returns birthDate
4. Calculate age from birthDate
5. **Can verify 18+ requirement**

#### Can You Verify Age from Phone Number Alone?
- **No.** Phone number alone does not map to personnummer in SPAR
- You need the personnummer first (obtainable if user provides it, or via Swish payerPersonalNumber validation)
- Flow: Swish payment (validates phone+personnummer match) -> SPAR lookup (personnummer -> birthDate -> age)

#### SPAR Access Requirements
- Must apply for access through Roaring (they are a SPAR delegate)
- Roaring assists with the entire SPAR application process
- Requires legitimate purpose (KYC, age verification qualifies)
- Application process: https://help.roaring.io/en/articles/99112

#### Pricing
- **Not publicly listed** — contact required (info@roaring.io)
- Company search API: no charge per call (but person lookups likely different)
- Pricing page: https://www.roaring.io/pricing (requires contact)
- Estimated: SEK 1-5 per lookup based on industry norms

#### Alternative Providers
- **Direct SPAR access** — apply directly at statenspersonadressregister.se (slower, more bureaucratic)
- **Bisnode/Dun & Bradstreet** — Swedish person data
- **ZignSec** — identity verification including Swedish personnummer (https://docs.zignsec.com/)
- **BankID verification** — strongest Swedish ID verification, confirms personnummer + name

---

## 3. Payment Processing for Adult Content Platforms

### Why Adult Platforms Are "High-Risk Merchants"
1. **High chargeback rates** — buyer's remorse, privacy concerns (family sees statement), unrecognized billing descriptors. Rates can hit 5%+ (industry threshold is 0.75%)
2. **Regulatory complexity** — varying laws across jurisdictions
3. **Reputational risk** — banks fear association with adult content
4. **Fraud rates** — higher than average due to stolen card use
5. **Content liability** — risk of illegal content appearing on platform

### CRITICAL: Sweden's Law Proposition 2024/25:124 (effective July 1, 2025)

**This law directly impacts the platform.** Key points:
- Criminalizes **purchasing live/custom sexual content online** (up to 1 year prison)
- Criminalizes **facilitating or profiting** from such transactions
- **What's still legal:** Pre-recorded content, subscription to accounts posting content, consuming porn without influencing its creation
- **What's illegal:** Paying for live cam shows, custom sexual content, real-time sexual performances
- Payment processors must assess whether merchants facilitate commissioned sexual content
- **Impact on Lustre:** If the platform includes any live/interactive sexual content features or marketplace for custom content, this law applies. A dating platform with messaging/meetup features should be fine, but any content marketplace needs careful legal review.

Source: https://segpay.com/blog/navigating-swedens-law-proposition-2024-25124/
Source: https://www.loc.gov/item/global-legal-monitor/2025-06-10/sweden-parliament-criminalizes-the-purchase-of-online-sexual-acts/

### Specialized Adult Payment Processors

| Processor | Fees | EU Support | Key Features |
|-----------|------|------------|--------------|
| **Segpay** | 4-15% per transaction (custom quoted) | YES — FCA + CBI licenses, 15 languages | EU + US licensed, discreet billing, chargeback management |
| **CCBill** | 10.8-14.5% (adult), 3.9% + $0.55 (standard) | YES | Subscription billing, global payments, 30+ years in adult |
| **Epoch** | ~12-15% (estimated) | YES | Long-standing adult processor |
| **CommerceGate** | Custom | YES (EU-based) | Scalable adult payment gateway |
| **Corepay** | Custom | YES | Dating-specific merchant accounts, 24-72hr approval |

**Reserves:** Expect 0-20% held for 90-180 days (rolling reserve against chargebacks)

### Stripe's Policy — CANNOT USE for Adult Content

**Stripe explicitly prohibits:**
- Pornography depicting sexual acts
- Adult services (escorts, pay-per-view, adult live chat)
- Fetish services
- **ALL online dating services** (added January 2024 — the word "all" was added)
- AI-generated content meeting adult criteria

**Conclusion: Stripe is NOT an option for an adult dating platform.**
However, Stripe CAN be used for Swish payments (non-adult commerce). Consider using Stripe as Swish gateway for token purchases IF the platform is classified as "dating" not "adult."

### Token/Credit System Implementation
- Use a specialized adult processor (Segpay/CCBill) for card payments
- Use Swish for Swedish users (lower fees, higher trust, identity verification)
- Internal wallet/token system: user buys credits -> spends on platform features
- Auto-topup: trigger Swish payment request when balance falls below threshold (user must confirm in Swish app each time unless recurring API works)
- **Key insight:** The token layer abstracts the payment processor. Users buy tokens; the platform doesn't process payments per-interaction.

---

## 4. Swedish Company Formation (AB)

### Aktiebolag (AB) Requirements

| Requirement | Details |
|-------------|---------|
| **Share capital** | SEK 25,000 minimum (private AB) |
| **Registration** | Bolagsverket (Swedish Companies Registration Office) |
| **Registration fee** | ~SEK 2,200 (electronic) |
| **Timeline** | ~10 days for registration |
| **Board** | At least 1 board member + 1 deputy; 50%+ must reside within EEA |
| **Auditor** | Required if company exceeds certain thresholds |
| **Bank account** | Swedish/EEA bank account required; bank certificate needed before registration |
| **Total first-year cost** | SEK 68,900 - 137,200 (including legal, accounting, office, insurance) |

**Registration process:**
1. Draft articles of association (bolagsordning)
2. Open bank account and deposit SEK 25,000 share capital
3. Obtain bank certificate
4. Submit registration to Bolagsverket (online at verksamt.se)
5. Receive organisationsnummer (~10 days)
6. Register for F-skatt, moms (VAT), arbetsgivarregistrering at Skatteverket

**Source:** https://bolagsverket.se/en/foretag/aktiebolag/startaaktiebolag.479.html

### Data Protection Officer (DPO) Requirement

A DPO is **mandatory** under GDPR Article 37 when:
- Core activities involve **large-scale processing of special category data** (sexual orientation = special category)
- Core activities involve **regular and systematic monitoring of individuals on a large scale**

**A dating platform processing sexual orientation data at scale MUST appoint a DPO.**

DPO notification to IMY:
- Form (Swedish only) submitted to: dataskyddsombud@imy.se
- Must inform all employees and data subjects about the DPO's contact details
- Source: https://www.imy.se/en/organisations/forms-and-e-services/announce-that-you-have-a-data-protection-officer/

### IMY Notification
- No general notification/registration requirement in Sweden for data processing
- **However:** DPIA must be conducted BEFORE processing begins
- If DPIA shows high risk that cannot be mitigated, you must **consult IMY before processing** (Article 36 prior consultation)
- Breach notification: 72 hours to IMY after becoming aware of a personal data breach
- Source: https://www.imy.se/en/organisations/forms-and-e-services/notification-of-a-personal-data-breach/

---

## 5. GDPR Compliance — Technical Implementation

### Special Category Data: Sexual Orientation

**Article 9 GDPR** prohibits processing special category data UNLESS:
- **Explicit consent** (Article 9(2)(a)) — user explicitly consents to processing of sexual orientation data
- Must be freely given, specific, informed, unambiguous
- Must be separately consented to (not buried in T&C)
- Must be easily withdrawable

**Technical requirements for special category data:**
1. **Encryption at rest** — AES-256 or equivalent for all databases containing orientation data
2. **Encryption in transit** — TLS 1.3 minimum
3. **Access controls** — strict role-based access; minimal employees can view special category data
4. **Pseudonymization** — separate identity data from preference data where possible
5. **Audit logging** — all access to special category data must be logged
6. **Data minimization** — only collect what's necessary
7. **Purpose limitation** — only use for stated purpose (matching, not advertising)

### Right to Deletion (Article 17) — Technical Architecture

**Implementation pattern for distributed systems:**

1. **Deletion Orchestrator Service**
   - Central service that maintains a registry of ALL services/databases holding user data
   - On deletion request: sends deletion commands to each service via message queue
   - Retry logic + audit logging
   - Confirmation from each service before marking complete

2. **Data Map** (prerequisite)
   - Document every system, database, cache, log, backup, and third-party service that holds personal data
   - Map: user_id -> [service1_table, service2_cache, service3_logs, cdn_images, ...]

3. **Deletion methods:**
   - Hard delete from live databases
   - **Cryptographic erasure** for encrypted data — delete the encryption key
   - Anonymize in analytics/aggregates (replace with hashed placeholder)
   - Backups: mark as "beyond use" until natural rotation, or implement backup-level deletion

4. **Timeline:** Must respond within 1 month (extendable to 3 months for complex requests)

5. **Exceptions:** Can retain data needed for legal obligations, legal claims, public interest

### DPIA (Data Protection Impact Assessment)

**Mandatory for Lustre** because:
- Processing special category data (sexual orientation) on a large scale
- Systematic monitoring of individuals (matching algorithms, usage tracking)
- Innovative technology use (AI matching, location-based features)

**DPIA Process:**
1. Describe the processing (what data, why, how)
2. Assess necessity and proportionality
3. Identify and assess risks to individuals
4. Identify measures to mitigate risks
5. Document everything
6. If residual high risk remains: consult IMY before processing

**Tools:**
- **CNIL PIA Tool** (open source) — https://www.cnil.fr/en/open-source-pia-software-helps-carry-out-data-protection-impact-assessment
- **GDPRDPIAT** (GitHub) — https://github.com/simonarnell/GDPRDPIAT
- **Privado** (open source) — automates GDPR compliance in code: https://www.privado.ai/
- **ECOMPLY.io** — free GDPR tools
- **CNIL GDPR Toolkit** — https://www.cnil.fr/en/my-compliance-tools/gdpr-toolkit

### Cookie Consent for Sweden

- Sweden enforces via **GDPR** + **LEK (Lagen om elektronisk kommunikation)**
- Two authorities: **PTS** (primary for cookies) and **IMY** (data protection)
- **2025 enforcement shift:** Swedish DPA now targets manipulative cookie banners
- Requirements:
  - Accept and reject buttons must have **equal visual prominence**
  - No pre-ticked boxes
  - Must be able to withdraw consent easily
  - **TCF v2.3** mandatory from February 28, 2026 (if using ad tech)
  - Google Consent Mode v2 mandatory for European advertisers

**Recommended tools:** Cookiebot, OneTrust, Cookie Information (Swedish company), Didomi

---

## 6. App Store Policies

### Apple App Store

**Key guidelines (Section 1.1.4):**
- Prohibits "overtly sexual or pornographic material"
- Prohibits apps that facilitate prostitution or human trafficking
- **"Hookup" apps** are specifically called out as potentially problematic
- Dating apps allowed but must have strong content moderation
- **New 2026 rule:** Creator apps must implement age verification mechanism based on verified or declared age

**Recent enforcement (2025-2026):**
- **Sniffies** (queer cruising app) — temporarily removed May 2025 for content policy violations
- **Tea & TeaOnHer** — pulled October 2025 for content moderation failures + minor exposure
- Apple is increasingly strict on dating apps

**Strategy for approval:**
- Keep all explicit content behind private messaging (not in public profiles)
- Implement robust age verification
- Strong content moderation + reporting system
- Rate the app 17+ with appropriate content descriptors
- No nudity in user-generated public content

### Google Play Store

**Key policies:**
- Prohibits lewd/profane content in store listing and in-app
- Prohibits compensated dating ("sugar dating") apps (banned September 2021)
- Requires compliance with **Child Safety Standards**
- Dating apps must clearly prohibit child exploitation in ToS
- Nudity allowed only for educational/documentary/scientific/artistic purposes

**Strategy for approval:**
- Same as Apple: explicit content behind private gates
- Clear age-gating
- Robust ToS and community guidelines
- Content moderation system

### How Existing Adult-Adjacent Apps Handle It

**Grindr:**
- No nudity in public profiles (App Store compliant)
- Explicit content allowed in **private chats and albums** only
- Supports app-store-level age verification (proposed US legislation)
- Rated 17+ on App Store

**Feeld:**
- Positions as "alternative relationships" not "adult"
- Content moderation for public profiles
- Private messaging has more latitude

**FetLife:**
- **NOT on any app store** — removed years ago
- Uses **web-only** access (mobile-optimized website)
- Users can "add to home screen" for PWA-like experience
- Paused app development as of August 2025
- Previously had open-source Android APK for sideloading

### PWA as Backup Strategy

**Advantages:**
- No app store approval needed
- Full control over content policies
- No 30% app store commission on in-app purchases
- Can be installed to home screen
- Push notifications (with user permission)

**Limitations:**
- No App Store/Play Store discoverability
- iOS PWA limitations (no background processing, limited push notification support historically — improving)
- Users less familiar with PWA installation
- Cannot use Apple Pay / Google Pay in-app (but can use Swish/web payments)

**Recommendation:** Launch on App Store with clean version + PWA with full features as parallel channel. Marketing drives users to both.

Source on PWA publishing: https://www.mobiloud.com/blog/publishing-pwa-app-store

---

## 7. SOS Alarm / 112 Integration

### SOS Alarm Overview
- Sweden's national emergency services operator
- Handles all 112 calls
- Coordinates police, fire, ambulance
- Also handles public warnings and civil defense
- **Website:** https://www.sosalarm.se/en/

### Is There an API?

**SOS Alarm Data API:** YES — delivers JSON data on emergency calls, incidents, and rescue operations
- Reference: https://henrikhjelm.se/api/sos/
- Provides statistics and incident data
- **This is for data consumption, NOT for triggering emergencies**

**112 App:**
- Official app by SOS Alarm (iOS + Android)
- Sends approximate location when calling 112
- Receives incident notifications nearby
- **Cannot be triggered by third-party apps**

### Third-Party Integration Options

1. **sos-access** — integration library by Palmlund Wahlgren
   - Docs: https://sos-access.readthedocs.io/
   - HTTP REST API via https://alarmer.io
   - Alternative to direct integration with alarm operators
   - Used by alarm/security companies

2. **Third Party Service Provider (TPSP) agreements**
   - SOS Alarm contracts with TPSPs (currently 3 in Sweden)
   - TPSPs must sign written agreements to get E.164 number access
   - Primarily designed for vehicle eCall and alarm companies, not consumer apps

3. **Advanced Mobile Location (AML)**
   - Built into Android and iOS at OS level
   - When user calls 112, phone automatically sends GPS/WiFi location to SOS Alarm
   - Accuracy: 15-65 meters
   - Used in ~82% of mobile emergency calls
   - **Apps cannot trigger AML** — it's an OS-level feature activated by dialing 112

4. **eCall**
   - EU mandate for vehicles (since 2018)
   - Sends crash data + location to 112
   - Third-party eCall requires TPSP agreement
   - **Not applicable for dating app safety**

### Practical Safety Implementation for Lustre

Since direct 112 API integration is not available for consumer apps, recommended approach:

1. **Emergency button** — triggers `tel:112` (standard phone call to 112)
2. **Location sharing** — share real-time GPS with trusted contacts during meetups
3. **Timer/check-in** — "I'm meeting someone; alert my contacts if I don't check in by X"
4. **Discreet alert** — hidden gesture triggers alert to pre-set contacts with location
5. **Post-incident reporting** — in-app tools to report to police (link to polisen.se)

**2026 development:** SOS Alarm implementing satellite-based emergency messaging for areas without cellular coverage.

### Legal Requirements for Emergency Features
- No legal requirement to integrate with 112 for a dating app
- If you claim "emergency" features, ensure they work reliably (liability risk)
- GDPR applies to location data shared for safety features
- Consider: recording/storing location data for safety creates data protection obligations

---

## 8. Trademark Registration — "Lustre"

### PRV (Swedish Trademark)

**Authority:** Patent- och registreringsverket (PRV)
**Website:** https://www.prv.se/en/trademarks/

| Item | Details |
|------|---------|
| **Application fee** | SEK 2,700 (e-service) / SEK 3,900 (paper) per class |
| **Additional classes** | SEK 900 per class |
| **Timeline** | 3-6 months (no objections); up to 12 months (with objections) |
| **Validity** | 10 years from filing date, renewable indefinitely |
| **Opposition period** | 3 months from publication date |

**Process:**
1. Search existing trademarks: https://www.prv.se/en/trademarks/trademark-databases/
2. File application online at PRV
3. PRV examines distinctiveness + conflicts
4. Published for 3-month opposition period
5. Registration granted

**Relevant classes for Lustre:**
- **Class 9** — Software, mobile applications, downloadable apps
- **Class 38** — Telecommunications, electronic communication services
- **Class 42** — Software as a service (SaaS), hosting, IT services
- **Class 45** — Social networking services, dating services, personal safety services

**Cost estimate:** SEK 2,700 + (3 x SEK 900) = **SEK 5,400** for 4 classes

**Important:** Search PRV's Swedish Trademark Database AND TMview (EU-wide) for existing "Lustre" registrations before filing. "Lustre" is a common English word which may affect distinctiveness assessment.

### EUIPO (EU Trademark)

**Authority:** European Union Intellectual Property Office
**Website:** https://www.euipo.europa.eu/

| Item | Details |
|------|---------|
| **Application fee** | EUR 850 (1 class online) |
| **Second class** | EUR 50 |
| **Each additional class** | EUR 150 |
| **Timeline** | 4-6 months (no opposition); 12-18 months (if opposed) |
| **Validity** | 10 years, renewable |
| **Coverage** | All 27 EU member states |

**Cost for 4 classes:** EUR 850 + 50 + 150 + 150 = **EUR 1,200**

**With attorney fees:** EUR 1,100 - 1,600 total

**Recommendation:** File at PRV first (faster, cheaper, establishes priority), then file EUIPO within 6 months claiming PRV priority date.

**SME Fund:** EU offers 75% reimbursement on trademark fees for SMEs through the SME Fund (check eligibility at https://www.euipo.europa.eu/en/discover-ip/sme-fund).

---

## Summary: Critical Path Actions

1. **Form AB** — SEK 25,000 capital + registration at Bolagsverket
2. **Trademark search** — Search PRV + EUIPO databases for "Lustre" conflicts
3. **File PRV trademark** — Classes 9, 38, 42, 45 (~SEK 5,400)
4. **Appoint DPO** — Mandatory for special category data processing
5. **Conduct DPIA** — Required before launch; use CNIL PIA tool
6. **Swish Handel agreement** — Sign with a Swedish bank
7. **Payment processor** — Segpay or CCBill for card payments; Swish for Swedish users
8. **SPAR/Roaring access** — Apply for population register access (age verification)
9. **Legal review** — Proposition 2024/25:124 implications for any content marketplace features
10. **App Store submission** — Clean version for stores + PWA with full features

---

## Key Sources

### Swish
- [Swish Developer Documentation](https://developer.swish.nu/)
- [Swish Commerce API Setup](https://developer.swish.nu/documentation/getting-started/swish-commerce-api)
- [Swish Payout API Setup](https://developer.swish.nu/documentation/getting-started/swish-payout-api)
- [Swish Recurring Payments API](https://developer.swish.nu/api/recurring-payments)
- [Swish Payment Request API](https://developer.swish.nu/api/payment-request)
- [Node.js Swish Library](https://github.com/monkybrain/swish-payment)

### SPAR / Identity
- [Roaring.io Population Register](https://www.roaring.io/en/services/population-register/)
- [Roaring Developer Portal](https://developer.roaring.io/)
- [SPAR Official](https://www.statenspersonadressregister.se/master/start/english-summary/)
- [Roaring SPAR Application Guide](https://help.roaring.io/en/articles/99112)

### Payment Processing
- [Segpay High-Risk Merchants](https://segpay.com/verticals/high-risk/)
- [Segpay EU Merchants](https://segpay.com/solutions/eu-merchants/)
- [CCBill vs Segpay Comparison](https://paymentproviders.io/compare/segpay-vs-ccbill)
- [Corepay Dating Merchant Accounts](https://corepay.net/industries/online-dating-merchant-accounts/)
- [Best Adult Payment Gateways 2026](https://myntpay.com/top-payment-gateways-for-adult-websites/)

### Swedish Law & Regulation
- [Sweden Proposition 2024/25:124 — Segpay Analysis](https://segpay.com/blog/navigating-swedens-law-proposition-2024-25124/)
- [Library of Congress — Sweden Criminalizes Online Sexual Acts](https://www.loc.gov/item/global-legal-monitor/2025-06-10/sweden-parliament-criminalizes-the-purchase-of-online-sexual-acts/)
- [Stripe Prohibited Businesses](https://support.stripe.com/questions/prohibited-and-restricted-businesses-list-faqs)

### Company Formation
- [Bolagsverket — Set Up Limited Company](https://bolagsverket.se/en/foretag/aktiebolag/startaaktiebolag.479.html)
- [AB Capital Requirement 2026](https://www.lync.me/blog/669/starting-business-aktiebolag-capital-requirement-2026)
- [Sweden Company Formation Guide](https://companyformationsweden.com/set-up-ab-ltd-company-sweden/)

### GDPR & Data Protection
- [IMY — Data Protection Officers](https://www.imy.se/en/organisations/data-protection/this-applies-accordning-to-gdpr/data-protection-officers/)
- [IMY — DPO Notification](https://www.imy.se/en/organisations/forms-and-e-services/announce-that-you-have-a-data-protection-officer/)
- [GDPR Special Categories Guide](https://www.privacyforge.ai/blog/special-categories-of-data-under-gdpr-complete-compliance-guide-2025)
- [CNIL Open Source PIA Tool](https://www.cnil.fr/en/open-source-pia-software-helps-carry-out-data-protection-impact-assessment)
- [Privado Open Source Compliance](https://www.privado.ai/)
- [Sweden Data Protection Overview — Legal500](https://www.legal500.com/guides/chapter/sweden-data-protection-cybersecurity/)
- [Cookie Law Sweden — Didomi](https://www.didomi.io/blog/cookie-law-in-sweden-what-you-should-know-to-be-compliant)

### App Stores
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Inappropriate Content Policy](https://support.google.com/googleplay/android-developer/answer/9878810)
- [FetLife App Strategy](https://fetlife.news/does-fetlife-have-an-app/)
- [PWA App Store Publishing 2026](https://www.mobiloud.com/blog/publishing-pwa-app-store)

### Emergency Services
- [SOS Alarm — 112 App](https://www.sosalarm.se/en/112-and-other-important-numbers/the-112-app/)
- [AML in Sweden — Eurisy](https://www.eurisy.eu/stories/pinpointing-emergencies-how-gnss-enhanced-aml-transformed-swedens-112-response/)
- [sos-access Library](https://sos-access.readthedocs.io/)
- [SOS Alarm API](https://henrikhjelm.se/api/sos/)

### Trademarks
- [PRV Trademarks](https://www.prv.se/en/trademarks/)
- [PRV Fees](https://www.prv.se/en/ip-professional/trademarks/fees-and-payment/)
- [PRV Trademark Databases](https://www.prv.se/en/trademarks/trademark-databases/)
- [EUIPO Fees](https://www.euipo.europa.eu/en/trade-marks/before-applying/fees-payments)
- [EU SME Fund for IP](https://www.euipo.europa.eu/en/discover-ip/sme-fund)

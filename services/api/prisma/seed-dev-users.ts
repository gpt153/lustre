/**
 * Dev seed: 20 celebrity-inspired test profiles (15 women, 5 men)
 * INTERNAL USE ONLY — never run in production
 */
import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

function hash(s: string) {
  return createHash('sha256').update(s).digest('hex')
}

const celebrityPhotos: Record<string, string[]> = {
  'Scarlett J': [
    'https://upload.wikimedia.org/wikipedia/commons/a/ad/Scarlett_Johansson-8588.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/6/60/Scarlett_Johansson_by_Gage_Skidmore_2_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/d/db/Scarlett_Johansson_2003.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/1b/Scarlett_Johansson_SDCC_2013_by_Gage_Skidmore_1.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c0/Scarlett_Johansson_6%2C_2012.jpg',
  ],
  'Angelina J': [
    'https://upload.wikimedia.org/wikipedia/commons/1/12/Angelina_Jolie-643531_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/0/0c/Angelina_Jolie_by_Gage_Skidmore.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/b/b1/Angelina_Jolie_2010.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/2/22/Angelina_Jolie-64408.jpg',
  ],
  'Margot R': [
    'https://upload.wikimedia.org/wikipedia/commons/5/57/SYDNEY%2C_AUSTRALIA_-_JANUARY_23_Margot_Robbie_arrives_at_the_Australian_Premiere_of_%27I%2C_Tonya%27_on_January_23%2C_2018_in_Sydney%2C_Australia_%2828074883999%29_%28cropped_2%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/98/Margot_Robbie_at_Somerset_House_in_2013_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c5/Margot_Robbie_%2853012385004%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/2/26/Margot_Robbie_2016_cropped_and_retouched.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/0/0b/Margot_Robbie_%2828316659170%29_%28cropped%29.jpg',
  ],
  'Jennifer L': [
    'https://upload.wikimedia.org/wikipedia/commons/6/6e/Jennifer_Lopez_at_the_2025_Sundance_Film_Festival_%28cropped_3%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c3/Jennifer_Lopez_at_GLAAD_Media_Awards.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/0/07/Jennifer_Lopez_at_GLAAD_Media_Awards_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/ea/Jennifer_Lopez_at_the_2025_Sundance_Film_Festival_1.jpg',
  ],
  'Zoe S': [
    'https://upload.wikimedia.org/wikipedia/commons/e/e1/Zoe_Salda%C3%B1a_at_the_2024_Toronto_International_Film_Festival_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/9c/Zoe_Saldana_at_the_2024_Toronto_International_Film_Festival_4.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/8/86/Zoe_Saldana_2013.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/31/Zoe_Saldana_by_Gage_Skidmore_3.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/3a/Zoe_Saldana_press_conference_Cannes_2024.jpg',
  ],
  'Charlize T': [
    'https://upload.wikimedia.org/wikipedia/commons/5/5d/Charlize-theron-IMG_6045.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/47/Charlize_Theron_%282019%29_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f3/Charlize_Theron_2005.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/47/Charlize_Theron_by_Gage_Skidmore.jpg',
  ],
  'Eva M': [
    'https://upload.wikimedia.org/wikipedia/commons/1/11/Eva_Mendes_2009.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/fa/Eva_Rinaldi_Eva_Mendes_%2852509644038%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/ed/Eva_Mendes_%2852509627363%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f8/Eva_Mendes_%2852509355049%29.jpg',
  ],
  'Priyanka C': [
    'https://upload.wikimedia.org/wikipedia/commons/4/45/Priyanka_Chopra_at_Bulgary_launch%2C_2024_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/57/Priyanka_Chopra_at_Filmfare_Awards_2013.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/36/Priyanka_Chopra_at_The_Sky_Is_Pink_Promotions.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/6/6c/Priyanka-chopra-gesf-2018-7565.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/fa/Priyanka_Chopra_at_an_event_for_Umang_2020_%2865%29.jpg',
  ],
  'Halle B': [
    'https://upload.wikimedia.org/wikipedia/commons/a/aa/Halle_Berry-1910.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/56/Halle_Berry_by_Gage_Skidmore_2.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/4f/Halle_Berry-0343.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/71/Halle_Berry_%2835990584381%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c4/Halle_Berry_-_TIFF_2012.jpg',
  ],
  'Lupita N': [
    "https://upload.wikimedia.org/wikipedia/commons/4/4c/Lupita_Nyong%27o_by_Gage_Skidmore_4.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/2/2c/Lupita_Nyong%27o%2C_by_Gordon_Correll_%28cropped%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/07/LupitaNyong%27oTIFFSept2013.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/e/e4/Lupita_Nyong%27o_%2853673310248%29_cropped.jpg",
  ],
  'Rihanna': [
    'https://upload.wikimedia.org/wikipedia/commons/1/16/Rihanna_visits_U.S._Embassy_in_Barbados_2024_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e9/Rihanna_by_Rajasekharan_2019.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c2/Rihanna_Fenty_2018.png',
    'https://upload.wikimedia.org/wikipedia/commons/2/2d/Rihanna_2012_%28Cropped%29.jpg',
  ],
  'Gal G': [
    'https://upload.wikimedia.org/wikipedia/commons/3/3e/Gal_Gadot_at_the_2018_Comic-Con_International.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f1/Gal_Gadot_at_the_2018_Comic-Con_International_2.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/b/b9/Gal_Gadot_at_the_2018_Comic-Con_International_5.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/0/08/Gal_Gadot_for_Revlon_%28cropped%29.jpg',
  ],
  'Zendaya': [
    'https://upload.wikimedia.org/wikipedia/commons/2/28/Zendaya_-_2019_by_Glenn_Francis.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f3/Zendaya_2019_by_Glenn_Francis_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/8/8b/Zendaya_at_The_Greatest_Showman_Australian_premiere.jpg',
  ],
  'Sydney S': [
    'https://upload.wikimedia.org/wikipedia/commons/b/b0/Sydney_Sweeney_at_Berlinale_2023_%28portrait%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/b/b7/Sydney_Sweeney_at_Berlinale_2023.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/d/d5/Sydney_Sweeney_at_Berlinale_2023_%28cropped%29.jpg',
  ],
  'Florence P': [
    'https://upload.wikimedia.org/wikipedia/commons/0/0d/Florence_Pugh_in_2020_%281%29_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/6/6d/Florence_Pugh_in_2020_%282%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/3f/Florence_Pugh_at_the_58th_BFI_London_Film_Festival_Awards_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/b/bf/Florence_Pugh_The_Falling_Premiere_2014.jpg',
  ],
  // ── Men ──
  'Brad P': [
    'https://upload.wikimedia.org/wikipedia/commons/9/90/Brad_Pitt-69858.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/4c/Brad_Pitt_2019_by_Glenn_Francis.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/6/60/Brad_Pitt_2013.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/98/Brad_Pitt_in_2014_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c6/Brad_Pitt_at_81st_Venice_International_Film_Festival.jpg',
  ],
  'Ryan G': [
    'https://upload.wikimedia.org/wikipedia/commons/6/62/GoslingBFI081223_%2822_of_30%29_%2853388157347%29_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f6/Ryan_Gosling_in_2018.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/78/Ryan_Gosling_%2817056601751%29_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/46/Ryan_Gosling_Cannes_2014.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e6/Ryan_Gosling_by_Gage_Skidmore.jpg',
  ],
  'Chris H': [
    'https://upload.wikimedia.org/wikipedia/commons/8/86/Chris_Hemsworth_-_Crime_101.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/6/69/Chris_Hemsworth_by_Gage_Skidmore_3.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/4c/Chris_Hemsworth_by_Gage_Skidmore.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e8/Chris_Hemsworth_by_Gage_Skidmore_2_%28cropped%29.jpg',
  ],
  'Jason M': [
    'https://upload.wikimedia.org/wikipedia/commons/2/22/Jason_Momoa_%2843055621224%29_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e0/Jason_Momoa%2C_Aquaman_%2845655623114%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/d/d6/Jason_Momoa_by_Gage_Skidmore.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/58/Jason_Momoa_by_Gage_Skidmore_2.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/cb/Jason_momoa.jpg',
  ],
  'Idris E': [
    'https://upload.wikimedia.org/wikipedia/commons/3/3a/Idris_Elba_A_House_of_Dynamite-21_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/d/d6/Idris_Elba-5272.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/0/0e/Idris_Elba-4580_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/b/b8/Idris_Elba_2014.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/3d/Idris_Elba_in_2024_%28cropped%29.jpg',
  ],
}

const celebrities = [
  // ═══════════════════════════════════════════════════
  // WOMEN (15)
  // ═══════════════════════════════════════════════════
  {
    displayName: 'Scarlett J',
    age: 39,
    gender: 'WOMAN',
    orientation: 'BISEXUAL',
    relationshipType: 'SINGLE',
    seeking: ['DATING', 'CASUAL', 'PLAY_PARTNER'],
    contentPreference: 'OPEN',
    bio: 'Skådespelerska och sångerska från New York. Älskar jazz, yoga på taken i Manhattan och bra whisky. Direkt, rolig och vet vad jag vill. Har en känsla för det dramatiska men tar mig själv lagom seriöst.',
    spicyBio: 'Gillar att ta kontroll men kan överraskas. Fascinerad av sensorisk lek och mjuk dominans. Har en svaghet för rep och bra teknik.',
    kinks: ['Rope bondage', 'Blindfolds', 'Domination', 'Sensation play', 'Hair pulling'],
    posts: [
      { text: 'Manhattan på natten slår allt annat. Fin drink, bra sällskap.', daysAgo: 1 },
      { text: 'Yoga på taket ikväll. Solnedgången var absurd.', daysAgo: 3 },
      { text: 'Bra whisky och ännu bättre konversation. Vad mer behöver man?', daysAgo: 7 },
      { text: 'Återkommer alltid till jazz. Det säger något om en person om de förstår bebop.', daysAgo: 14 },
      { text: 'NYC — kärleksfullt hatad varje dag.', daysAgo: 21 },
    ],
  },
  {
    displayName: 'Angelina J',
    age: 48,
    gender: 'WOMAN',
    orientation: 'BISEXUAL',
    relationshipType: 'SINGLE',
    seeking: ['RELATIONSHIP', 'PLAY_PARTNER', 'NETWORKING'],
    contentPreference: 'EXPLICIT',
    bio: 'Lever på mina egna villkor. Humanitärt arbete, konst och äventyr. Förälder och orolig optimist. Letar efter djup, inte yta. Har rest i 60 länder och blivit klokare i vartenda ett.',
    spicyBio: 'Total power exchange är det som verkligen tänder mig. Litar på rätt person med allt. Har utforskat mycket och vet vad jag vill.',
    kinks: ['Total power exchange', 'Slave/Master', 'Wax play', 'Knife play', 'Biting'],
    posts: [
      { text: 'Precis hem från Kambodja. Varje resa påminner mig om hur litet mina problem faktiskt är.', daysAgo: 2 },
      { text: 'Konst är det enda språket som inte behöver översättning.', daysAgo: 5 },
      { text: 'Mina barn lär mig mer om livet varje dag än jag lärde dem.', daysAgo: 12 },
      { text: 'Ensamhet och frihet är inte samma sak, men de hänger ihop.', daysAgo: 18 },
      { text: 'Tatueringar är dagboken jag aldrig kan förlora.', daysAgo: 30 },
    ],
  },
  {
    displayName: 'Margot R',
    age: 33,
    gender: 'WOMAN',
    orientation: 'STRAIGHT',
    relationshipType: 'SINGLE',
    seeking: ['DATING', 'PLAY_PARTNER', 'CASUAL'],
    contentPreference: 'OPEN',
    bio: 'Australienska i LA. Surfa, hockeyspela, festa och sedan ångra festen. Skrattar för högt och är stolt över det. Perth-tjej med solbränna och ambitioner.',
    spicyBio: 'Vill ha roligt, punkt. Gillar rollspel och att vara lite oförutsägbar. Öppen för det mesta om det finns kemi och humor.',
    kinks: ['Role play', 'Spanking', 'Hair pulling', 'Teasing', 'Biting'],
    posts: [
      { text: 'Surfsessionen var kaotisk men jag stod upp tre gånger. Det räknas.', daysAgo: 1 },
      { text: 'Hockey med killarna. De låtsas fortfarande som att det inte är konstigt att jag är bättre.', daysAgo: 4 },
      { text: 'Australiensiska fester vs. LA-fester — ingen tävling.', daysAgo: 9 },
      { text: 'Ny roll, ny karaktär, nytt obsessivt tänkande varje natt kl 2.', daysAgo: 16 },
      { text: 'Perth kommer alltid att vara hem. LA är bara det ställe jag jobbar.', daysAgo: 25 },
    ],
  },
  {
    displayName: 'Jennifer L',
    age: 54,
    gender: 'WOMAN',
    orientation: 'STRAIGHT',
    relationshipType: 'SINGLE',
    seeking: ['RELATIONSHIP', 'DATING'],
    contentPreference: 'OPEN',
    bio: 'Bronx-tjej som tog sig. Dansar, sjunger, producerar och orkar fortfarande. Tror på kärlek — möjligtvis för mycket. Arbetar på det. Aldrig för gammal för att börja om.',
    spicyBio: 'Gillar att vara i fokus och att visa upp sig. Performativ av naturen — det gäller även i sovrummet. Vill ha någon som matchar energin.',
    kinks: ['Voyeurism', 'Exhibitionism', 'Role play', 'Domination', 'Forced orgasm'],
    posts: [
      { text: 'Dans är det enda som stänger av hjärnan helt. Är tacksam för det varje dag.', daysAgo: 2 },
      { text: 'Bronx aldrig lämnat mig, oavsett vart jag åkt.', daysAgo: 6 },
      { text: 'Nya albumet känns som ett tredje hjärta. Så personligt att det nästan gör ont.', daysAgo: 11 },
      { text: 'Träning kl 5 på morgonen. Kroppen hatar det. Hjärnan behöver det.', daysAgo: 20 },
    ],
  },
  {
    displayName: 'Zoe S',
    age: 45,
    gender: 'WOMAN',
    orientation: 'BISEXUAL',
    relationshipType: 'POLYAMOROUS',
    seeking: ['PLAY_PARTNER', 'DATING', 'CASUAL'],
    contentPreference: 'EXPLICIT',
    bio: 'Jersey City via Santo Domingo. Skådespelerska, mamma, eldsjäl. Polyamorös och stolt. Tror på ärlig kommunikation framför allt annat. Tre barn och noll filter.',
    spicyBio: 'Erfaren och vet precis vad hon vill. Gillar sensorisk lek och mjuk dominans. Helt bekväm med komplicerade dynamiker.',
    kinks: ['Sensation play', 'Rope bondage', 'Power exchange', 'Wax play', 'Blindfolds'],
    posts: [
      { text: 'Polyamori handlar om kommunikation, inte om brist på kärlek. Tvärtom.', daysAgo: 1 },
      { text: 'Santo Domingo är alltid en del av mig. Kan höra musiken när jag stänger ögonen.', daysAgo: 8 },
      { text: 'Mina barn frågar de bästa frågorna. Ofta utan svar.', daysAgo: 15 },
      { text: 'Varje ny person du träffar öppnar ett rum du inte visste fanns.', daysAgo: 22 },
    ],
  },
  {
    displayName: 'Charlize T',
    age: 48,
    gender: 'WOMAN',
    orientation: 'STRAIGHT',
    relationshipType: 'SINGLE',
    seeking: ['RELATIONSHIP', 'DATING', 'PLAY_PARTNER'],
    contentPreference: 'OPEN',
    bio: 'Sydafrikanskt ursprung, LA-hjärta. Skördar citroner, adoptivmamma och otrolig bilcourage. Mer nördig än jag ser ut. Stark kaffe, starka åsikter.',
    spicyBio: 'Stark och oberäknelig i bästa mening. Gillar rollspel och att utforska gränser med förtroende. Dominant men lekfull.',
    kinks: ['Role play', 'Domination', 'Bondage', 'Spanking', 'Power exchange'],
    posts: [
      { text: 'Sydafrika är och förblir i mitt DNA. Besökte igår i tankarna, via en bra bok.', daysAgo: 3 },
      { text: 'Körde en Lamborghini på en öde väg. Det är terapi.', daysAgo: 10 },
      { text: 'Stark kvinna = svårhanterlig kvinna. I allas huvud utom mitt.', daysAgo: 17 },
      { text: 'LA-solnedgångar är galet vackra. Även om de är lite för performativa.', daysAgo: 28 },
    ],
  },
  {
    displayName: 'Eva M',
    age: 49,
    gender: 'WOMAN',
    orientation: 'STRAIGHT',
    relationshipType: 'PARTNERED',
    seeking: ['FRIENDSHIP', 'NETWORKING', 'CASUAL'],
    contentPreference: 'SOFT',
    bio: 'Miamiborna kubanare i LA. Mamma, konstnär och ständigt halvt på väg tillbaka till Sydamerika. Skrattar gärna men på mina villkor.',
    spicyBio: 'Sensuell och jordnära. Gillar mjuk dominans och ordentligt förspel. Inget brådskande — det ska dofta av parfym och smaka av tid.',
    kinks: ['Sensation play', 'Wax play', 'Massage', 'Tease and denial', 'Role play'],
    posts: [
      { text: 'Kuba är och förblir mitt hjärtas hemland. Besökte Miami imorse i en dröm.', daysAgo: 2 },
      { text: 'Ny tavla klar. Tog 6 veckor och 3 existenskriser.', daysAgo: 9 },
      { text: 'Solnedgången över Stilla havet. Varje gång. Aldrig rutin.', daysAgo: 19 },
    ],
  },
  {
    displayName: 'Priyanka C',
    age: 41,
    gender: 'WOMAN',
    orientation: 'STRAIGHT',
    relationshipType: 'SINGLE',
    seeking: ['RELATIONSHIP', 'DATING'],
    contentPreference: 'OPEN',
    bio: 'Desi-tjej som tagit hela världen. Producent, artist, skådespelerska. Gillar biryani och bourbon i lika delar. Söker djup, inte glitter. Mumbai i hjärtat, världen som hemmaplan.',
    spicyBio: 'Vill ha intensiv kontakt och djup närvaro. Stark D/s-dynamik tilltalar. Gillar att bli sedd och att verkligen se.',
    kinks: ['Power exchange', 'Eye contact play', 'Bondage', 'Service submission', 'Sensation play'],
    posts: [
      { text: 'Mumbai vid soluppgången. Inget i världen luktar eller låter likadant.', daysAgo: 1 },
      { text: 'Biryani är kärlek. Bourbon är visdom. Båda behövs.', daysAgo: 7 },
      { text: 'Min mamma har fortfarande rätt om allt. Det är irriterande.', daysAgo: 13 },
      { text: 'Desi girl tar världen — men svarar fortfarande sin mamma varje kväll.', daysAgo: 24 },
    ],
  },
  {
    displayName: 'Halle B',
    age: 57,
    gender: 'WOMAN',
    orientation: 'STRAIGHT',
    relationshipType: 'SINGLE',
    seeking: ['DATING', 'RELATIONSHIP', 'PLAY_PARTNER'],
    contentPreference: 'OPEN',
    bio: 'Cleveland-kvinna, Cleveland-hjärta. Boxar, mediterar och springer på stranden kl 5. Tror på andraakter. Och tredje. 57 och aldrig starkare.',
    spicyBio: 'Stark och vacker och vet om det. Gillar att utforska sin submissiva sida med rätt person. Förtroende är allting.',
    kinks: ['Submission', 'Rope bondage', 'Wax play', 'Blindfolds', 'Orgasm control'],
    posts: [
      { text: 'Boxade i en timme imorse. Ingenting rensar hjärnan som ett bra jab-cross.', daysAgo: 1 },
      { text: 'Cleveland — folk glömmer alltid bort Cleveland. Det är deras förlust.', daysAgo: 5 },
      { text: 'Andraakter är bättre än förstanen. Tredje är bäst.', daysAgo: 12 },
      { text: '57 år. Aldrig känt mig starkare. Skriv upp det.', daysAgo: 23 },
    ],
  },
  {
    displayName: 'Lupita N',
    age: 40,
    gender: 'WOMAN',
    orientation: 'PANSEXUAL',
    relationshipType: 'SINGLE',
    seeking: ['DATING', 'RELATIONSHIP', 'PLAY_PARTNER'],
    contentPreference: 'OPEN',
    bio: 'Kenya via Mexico City via New Haven. Skådespelerska och berättare. Älskar teater, litteratur och att laga ugali. Nyfiken på allt och alla.',
    spicyBio: 'Pansexuell och öppen för det mesta med rätt person. Gillar sensoriska upplevelser och djup emotionell kontakt.',
    kinks: ['Sensation play', 'Rope bondage', 'Blindfolds', 'Wax play', 'Role play'],
    posts: [
      { text: 'Nairobi vid soluppgången. Hjärtat expanderar varje gång.', daysAgo: 3 },
      { text: 'Läste Chimamanda Ngozi Adichie om. Fortfarande lika träffande.', daysAgo: 8 },
      { text: 'Teater är det enda forum där vi fortfarande lyssnar på varandra i timmar.', daysAgo: 16 },
      { text: 'Nyfikenhet är den enda superkraften som inte tar slut.', daysAgo: 26 },
    ],
  },
  {
    displayName: 'Rihanna',
    age: 36,
    gender: 'WOMAN',
    orientation: 'BISEXUAL',
    relationshipType: 'SINGLE',
    seeking: ['CASUAL', 'PLAY_PARTNER', 'DATING'],
    contentPreference: 'EXPLICIT',
    bio: 'Barbados-tjej som aldrig slutade vara hungrig. Musik, mode, Fenty — allt är personligt. Vill ha äkthet, inte perfektion. Bad gal forever.',
    spicyBio: 'Dominant, sensuell och direkt. Gillar att sätta tempot och utforska gränser. Fetisch för lingerie och teasing som konstart.',
    kinks: ['Domination', 'Exhibitionism', 'Teasing', 'Sensation play', 'Blindfolds'],
    posts: [
      { text: 'Barbados i blodet, alltid. Oavsett vilken stad jag vaknar i.', daysAgo: 1 },
      { text: 'Fenty-kollektionen tar all min tid men jag ångrar inget.', daysAgo: 6 },
      { text: 'Musik är inte mitt jobb — det är mitt språk.', daysAgo: 11 },
      { text: 'Bad gal vibes hela veckan. Ingen ursäkt behövs.', daysAgo: 20 },
      { text: 'Lingerie är inte underkläder, det är en attityd.', daysAgo: 29 },
    ],
  },
  {
    displayName: 'Gal G',
    age: 38,
    gender: 'WOMAN',
    orientation: 'STRAIGHT',
    relationshipType: 'SINGLE',
    seeking: ['DATING', 'RELATIONSHIP'],
    contentPreference: 'OPEN',
    bio: 'Israeliska, före detta militär, skådespelerska. Bor i LA men hjärtat är i Tel Aviv. Stark kaffe, starka åsikter, mjukt hjärta. Söker någon som matchar intensiteten.',
    spicyBio: 'Disciplinerad och lekfull i samma person. Militärbakgrund ger en viss kontroll — gillar att ge och ta den. Älskar förtroende.',
    kinks: ['Power exchange', 'Domination', 'Blindfolds', 'Sensation play', 'Role play'],
    posts: [
      { text: 'Tel Aviv på sommaren. Inget slår det. Inget.', daysAgo: 2 },
      { text: 'Tränade Krav Maga imorse. Kroppen minns allt.', daysAgo: 8 },
      { text: 'Wonder Woman är en roll. Styrkan är inte det.', daysAgo: 15 },
      { text: 'Stark kaffe, inga kompromisser. Så funkar morgonen.', daysAgo: 22 },
    ],
  },
  {
    displayName: 'Zendaya',
    age: 27,
    gender: 'WOMAN',
    orientation: 'STRAIGHT',
    relationshipType: 'SINGLE',
    seeking: ['DATING', 'RELATIONSHIP', 'FRIENDSHIP'],
    contentPreference: 'SOFT',
    bio: 'Oakland-tjej som älskar mode, film och att vara hemma. Introvert med ett extrovert jobb. Bästa kvällen: film, popcorn, tystnad. Mest cool när jag inte försöker.',
    spicyBio: 'Nyfiken och utforskande men kräver förtroende och respekt. Gillar långsam uppbyggnad och ögonkontakt som varar.',
    kinks: ['Eye contact play', 'Sensation play', 'Tease and denial', 'Blindfolds', 'Hair pulling'],
    posts: [
      { text: 'Mode är konst som vi bär. Varje outfit berättar något.', daysAgo: 1 },
      { text: 'Oakland formade mig. LA förändrade mig. Vet inte vilken version som är bäst.', daysAgo: 5 },
      { text: 'Filmkväll med mig själv. Bästa datet jag haft på länge.', daysAgo: 13 },
      { text: 'Introvert energi i en extrovert värld. Det funkar, mestadels.', daysAgo: 19 },
    ],
  },
  {
    displayName: 'Sydney S',
    age: 26,
    gender: 'WOMAN',
    orientation: 'STRAIGHT',
    relationshipType: 'SINGLE',
    seeking: ['DATING', 'CASUAL', 'PLAY_PARTNER'],
    contentPreference: 'OPEN',
    bio: 'Spokane-tjej i Hollywood. MMA-tränar, mekar bilar, gör TV. Underskattad nörd. Gillar att överraska folk som tror de har mig fixerad.',
    spicyBio: 'Atletisk, nyfiken och äventyrlig. Gillar fysisk intensitet och att vara överraskande dominant. Stark och mjuk i rätt ordning.',
    kinks: ['Domination', 'Impact Play', 'Hair pulling', 'Teasing', 'Bondage'],
    posts: [
      { text: 'MMA-passet var brutalt idag. Älskar känslan av att inte kunna röra armarna.', daysAgo: 1 },
      { text: 'Mekade på min 69:a Ford Bronco hela dagen. Oljiga händer och frid i sinnet.', daysAgo: 4 },
      { text: 'Spokane miss dig. Small town energy hits different.', daysAgo: 10 },
      { text: 'Folk förväntar sig en sak. Jag levererar en annan. Det är min grej.', daysAgo: 18 },
    ],
  },
  {
    displayName: 'Florence P',
    age: 29,
    gender: 'WOMAN',
    orientation: 'BISEXUAL',
    relationshipType: 'SINGLE',
    seeking: ['DATING', 'RELATIONSHIP', 'CASUAL'],
    contentPreference: 'OPEN',
    bio: 'Oxford-tjej som sjunger till matlagningen. Skådespelerska, kock och aldrig rädd att säga vad jag tycker. Gillar bra mat, bra film och folk som inte tar sig själva för seriöst.',
    spicyBio: 'Öppen, nyfiken och aldrig tråkig. Gillar att leka med makt på ett jämställt sätt. Humor är lika viktigt i sovrummet.',
    kinks: ['Role play', 'Teasing', 'Spanking', 'Power exchange', 'Biting'],
    posts: [
      { text: 'Lagade en 4-rätters middag bara för mig själv. Kallas det self-care?', daysAgo: 2 },
      { text: 'Oxford i regn. Det finns inget vackrare. Fight me.', daysAgo: 7 },
      { text: 'Ny film, nytt accent. Den här gången: helt tokig.', daysAgo: 14 },
      { text: 'Att säga vad man tycker är inte modigt. Det är grundläggande.', daysAgo: 21 },
      { text: 'Matlagning är meditation. Allt annat är bara kaos.', daysAgo: 27 },
    ],
  },

  // ═══════════════════════════════════════════════════
  // MEN (5)
  // ═══════════════════════════════════════════════════
  {
    displayName: 'Brad P',
    age: 60,
    gender: 'MAN',
    orientation: 'STRAIGHT',
    relationshipType: 'SINGLE',
    seeking: ['DATING', 'CASUAL', 'RELATIONSHIP'],
    contentPreference: 'OPEN',
    bio: 'Arkitektur, motorcyklar och keramik. Oklahomakille som aldrig riktigt lämnade LA men drömmer om Toscana. Förvånansvärt bra kock. 60 och fortfarande nyfiken.',
    spicyBio: 'Gillar långsam uppbyggnad och ordentliga förspel. Fascinerad av voyeurism och ömsesidig utforskning. Tålmodig men intensiv.',
    kinks: ['Voyeurism', 'Tease and denial', 'Orgasm control', 'Sensation play', 'Ice play'],
    posts: [
      { text: 'Ny lerslöjdsession. Händerna smutsiga, huvudet tomt. Perfekt terapi.', daysAgo: 1 },
      { text: 'MC-tur längs PCH imorse. Ingenting slår det.', daysAgo: 5 },
      { text: 'Lagar pastarätten jag lärt mig i Bologna. Tredje försöket. Nästan.', daysAgo: 12 },
      { text: 'Arkitektur är det sättet vi berättar vad vi värdesätter — se bara på vad vi bygger.', daysAgo: 20 },
    ],
  },
  {
    displayName: 'Ryan G',
    age: 43,
    gender: 'MAN',
    orientation: 'STRAIGHT',
    relationshipType: 'SINGLE',
    seeking: ['RELATIONSHIP', 'DATING', 'CASUAL'],
    contentPreference: 'SOFT',
    bio: 'Kanadensare i LA. Spelar piano, bygger möbler och läser för mycket. Lite allvarligare än jag ser ut, lite roligare än jag verkar. Tysta vatten.',
    spicyBio: 'Intensiv och fokuserad. Tänder på djup närvaro — vara helt i stunden. Gillar mjuk dominans och att verkligen se sin partner.',
    kinks: ['Sensation play', 'Eye contact play', 'Orgasm control', 'Collar and leash', 'Domination'],
    posts: [
      { text: 'Avslutade pianostycket jag jobbat på i fyra månader. Det låter fortfarande fel.', daysAgo: 2 },
      { text: 'Byggde en bokhylla. Den är inte rak. Jag är okej med det.', daysAgo: 8 },
      { text: 'Kanada på vintern slog aldrig mig som romantiskt förrän jag slutade bo där.', daysAgo: 16 },
    ],
  },
  {
    displayName: 'Chris H',
    age: 40,
    gender: 'MAN',
    orientation: 'STRAIGHT',
    relationshipType: 'OPEN_RELATIONSHIP',
    seeking: ['CASUAL', 'PLAY_PARTNER', 'FRIENDSHIP'],
    contentPreference: 'OPEN',
    bio: 'Australiensare i Byron Bay. Surfa, träna och laga mat till familjen. Skratt är viktigare än status. Enorm men vänlig. Gillar öl och soluppgångar.',
    spicyBio: 'Gillar ömsesidig utforskning och är genuint nyfiken på sin partners njutning. Stark och mjuk på samma gång.',
    kinks: ['Impact Play', 'Spanking', 'Hair pulling', 'Biting', 'Orgasm control'],
    posts: [
      { text: 'Surfen var episk imorse. Byron Bay levererar alltid.', daysAgo: 1 },
      { text: 'Lagade ceviche med barnen. Det blev mer lek än mat. Bättre så.', daysAgo: 6 },
      { text: 'Australien är en annan planet. Saknar det varje dag jag är borta.', daysAgo: 14 },
      { text: 'Skrattet är det enda som håller igång det här galenskapiga livet.', daysAgo: 22 },
    ],
  },
  {
    displayName: 'Jason M',
    age: 44,
    gender: 'MAN',
    orientation: 'BISEXUAL',
    relationshipType: 'OPEN_RELATIONSHIP',
    seeking: ['CASUAL', 'PLAY_PARTNER', 'FRIENDSHIP'],
    contentPreference: 'EXPLICIT',
    bio: 'Hawaiisk rötter, världsmedborgare. Surfa, smida, tatueringsnörd. Varm och välkomnande men respekterar gränser. Naturen i allt jag gör.',
    spicyBio: 'Livlig, öppen och äventyrlig. Gillar groupplay och exhibitionism. Naturlig kropp, naturlig energi — inga pretentioner.',
    kinks: ['Exhibitionism', 'Voyeurism', 'Group play', 'Bondage', 'Spanking'],
    posts: [
      { text: 'Smide i morgonljuset. Hörde ingenting utom hammarens slag och fåglarna.', daysAgo: 1 },
      { text: 'Hawaii — det är inte ett ställe, det är ett tillstånd.', daysAgo: 4 },
      { text: 'Ny tatuering klar. Tolfte. Eller trettionde. Tappar räkningen.', daysAgo: 11 },
      { text: 'Surfade Pipe imorse. Bodyn säger att jag är för gammal. Jag lyssnar inte.', daysAgo: 19 },
      { text: 'Öppenhet är styrka. Tar lång tid att förstå det, men när du gör — allt ändras.', daysAgo: 28 },
    ],
  },
  {
    displayName: 'Idris E',
    age: 51,
    gender: 'MAN',
    orientation: 'STRAIGHT',
    relationshipType: 'SINGLE',
    seeking: ['RELATIONSHIP', 'DATING', 'CASUAL'],
    contentPreference: 'OPEN',
    bio: 'Hackney-kille som gjort London, NY och LA till hem. DJ, skådespelare, nöjd. Intensitet är min inställning — på och av scen.',
    spicyBio: 'Dominant av naturen och bekväm med det. Intensiv och fokuserad. Gillar att verkligen ta hand om sin partner — på alla sätt.',
    kinks: ['Domination', 'Service submission', 'Collar and leash', 'Orgasm control', 'Blindfolds'],
    posts: [
      { text: 'DJ-sett i Berlin igår. Publiken förstod det från ton ett. Det är allt jag vill.', daysAgo: 2 },
      { text: 'Hackney är fortfarande mer äkta än alla städer jag bott i.', daysAgo: 7 },
      { text: 'Skådespeleri och musik är samma sak — du sätter in hela dig och hoppas det räcker.', daysAgo: 15 },
      { text: 'Intensitet är inte aggression. Det är närvaro.', daysAgo: 25 },
    ],
  },
]

async function main() {
  console.log('Seeding dev users (15 women, 5 men)...')

  // Fetch kink tags from DB
  const allKinkTags = await prisma.kinkTag.findMany()
  const kinkTagMap = new Map(allKinkTags.map((t) => [t.name, t.id]))

  for (const celeb of celebrities) {
    // Create user
    const user = await prisma.user.upsert({
      where: { personnummer_hash: `dev-${celeb.displayName}` },
      update: { status: 'ACTIVE', displayName: celeb.displayName },
      create: {
        displayName: celeb.displayName,
        personnummer_hash: `dev-${celeb.displayName}`,
        status: 'ACTIVE',
      },
    })

    // Create or update profile
    const existing = await prisma.profile.findUnique({ where: { userId: user.id } })
    let profile
    if (existing) {
      profile = await prisma.profile.update({
        where: { userId: user.id },
        data: {
          displayName: celeb.displayName,
          bio: celeb.bio,
          age: celeb.age,
          gender: celeb.gender as any,
          orientation: celeb.orientation as any,
          relationshipType: celeb.relationshipType as any,
          seeking: celeb.seeking as any,
          contentPreference: celeb.contentPreference as any,
          verified: true,
          spicyModeEnabled: true,
        },
      })
    } else {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          displayName: celeb.displayName,
          bio: celeb.bio,
          age: celeb.age,
          gender: celeb.gender as any,
          orientation: celeb.orientation as any,
          relationshipType: celeb.relationshipType as any,
          seeking: celeb.seeking as any,
          contentPreference: celeb.contentPreference as any,
          verified: true,
          spicyModeEnabled: true,
        },
      })
    }

    // Photos
    await prisma.profilePhoto.deleteMany({ where: { profileId: profile.id } })
    const photos = celebrityPhotos[celeb.displayName] ?? []
    for (let i = 0; i < photos.length; i++) {
      await prisma.profilePhoto.create({
        data: {
          profileId: profile.id,
          url: photos[i],
          thumbnailSmall: photos[i],
          thumbnailMedium: photos[i],
          thumbnailLarge: photos[i],
          position: i,
          isPublic: true,
        },
      })
    }

    // Kink tags
    await prisma.profileKinkTag.deleteMany({ where: { profileId: profile.id } })
    for (const kinkName of celeb.kinks) {
      const tagId = kinkTagMap.get(kinkName)
      if (tagId) {
        await prisma.profileKinkTag.create({
          data: {
            profileId: profile.id,
            kinkTagId: tagId,
            interestLevel: ['CURIOUS', 'LIKE', 'LOVE'][Math.floor(Math.random() * 3)] as any,
          },
        })
      }
    }

    // Posts with varied dates
    await prisma.post.deleteMany({ where: { authorId: user.id } })
    for (const post of celeb.posts) {
      const hoursOffset = Math.random() * 12 * 60 * 60 * 1000
      await prisma.post.create({
        data: {
          authorId: user.id,
          text: post.text,
          createdAt: new Date(Date.now() - post.daysAgo * 24 * 60 * 60 * 1000 + hoursOffset),
        },
      })
    }

    console.log(`  ✓ ${celeb.displayName} (${photos.length} photos, ${celeb.posts.length} posts)`)
  }

  console.log(`\n✅ Seeded ${celebrities.length} celebrity profiles`)

  // ─── Social graph: swipes, matches, conversations, messages ───────────────

  console.log('\nSeeding social graph...')

  // Gather all seeded user IDs
  const allUsers = await prisma.user.findMany({
    where: { personnummer_hash: { startsWith: 'dev-' } },
    select: { id: true, displayName: true },
  })
  const userIdMap = new Map(allUsers.map((u) => [u.displayName, u.id]))

  // 10 mutual LIKE pairs → matches
  const matchPairs: Array<[string, string]> = [
    ['Scarlett J', 'Ryan G'],
    ['Margot R', 'Brad P'],
    ['Angelina J', 'Idris E'],
    ['Jennifer L', 'Chris H'],
    ['Zoe S', 'Jason M'],
    ['Charlize T', 'Brad P'],
    ['Rihanna', 'Jason M'],
    ['Gal G', 'Ryan G'],
    ['Halle B', 'Idris E'],
    ['Florence P', 'Chris H'],
  ]

  for (const [nameA, nameB] of matchPairs) {
    const userAId = userIdMap.get(nameA)
    const userBId = userIdMap.get(nameB)
    if (!userAId || !userBId) {
      console.warn(`  ⚠️  Could not find users for pair: ${nameA} / ${nameB}`)
      continue
    }

    // Mutual LIKE swipes
    await prisma.swipe.upsert({
      where: { userId_targetId: { userId: userAId, targetId: userBId } },
      update: {},
      create: { userId: userAId, targetId: userBId, action: 'LIKE' },
    })
    await prisma.swipe.upsert({
      where: { userId_targetId: { userId: userBId, targetId: userAId } },
      update: {},
      create: { userId: userBId, targetId: userAId, action: 'LIKE' },
    })

    // Match — ensure user1Id < user2Id alphabetically
    const [user1Id, user2Id] = [userAId, userBId].sort()
    const match = await prisma.match.upsert({
      where: { user1Id_user2Id: { user1Id, user2Id } },
      update: {},
      create: { user1Id, user2Id },
    })

    console.log(`  ✓ Match: ${nameA} ↔ ${nameB}`)

    // Conversations for the first 5 pairs
    const conversationPairs = matchPairs.slice(0, 5)
    if (!conversationPairs.some(([a, b]) => a === nameA && b === nameB)) continue

    const conversation = await prisma.conversation.upsert({
      where: { matchId: match.id },
      update: {},
      create: { matchId: match.id },
    })

    // Participants
    await prisma.conversationParticipant.upsert({
      where: { conversationId_userId: { conversationId: conversation.id, userId: userAId } },
      update: {},
      create: { conversationId: conversation.id, userId: userAId },
    })
    await prisma.conversationParticipant.upsert({
      where: { conversationId_userId: { conversationId: conversation.id, userId: userBId } },
      update: {},
      create: { conversationId: conversation.id, userId: userBId },
    })

    // Skip messages if already present
    const existingMessages = await prisma.message.count({
      where: { conversationId: conversation.id },
    })
    if (existingMessages > 0) {
      console.log(`    ✓ Conversation already has messages, skipping (${nameA} ↔ ${nameB})`)
      continue
    }

    // Realistic Swedish messages per pair
    const chatScripts: Record<string, Array<{ sender: string; content: string }>> = {
      'Scarlett J|Ryan G': [
        { sender: 'Scarlett J', content: 'Hej! Såg att du spelar piano — det är rätt ovanligt.' },
        { sender: 'Ryan G', content: 'Haha, ja jag vet. Inte det coolaste konversationsämnet kanske?' },
        { sender: 'Scarlett J', content: 'Tvärtom. Jag är svag för händer som vet vad de gör.' },
        { sender: 'Ryan G', content: 'Nu måste jag fråga om du menar det bokstavligt eller bildligt?' },
        { sender: 'Scarlett J', content: 'Varför inte båda? Vad gör du på fredag?' },
      ],
      'Margot R|Brad P': [
        { sender: 'Margot R', content: 'Oklahomakille som gör keramik? Det har jag inte sett förut.' },
        { sender: 'Brad P', content: 'Haha det överraskar de flesta. Vad gör en australienska i LA då?' },
        { sender: 'Margot R', content: 'Surfar, spelar hockey och ångrar mina val. Standard.' },
        { sender: 'Brad P', content: 'Hockey? Okej nu blev jag intresserad. Ska vi ta en öl?' },
        { sender: 'Margot R', content: 'Absolut. Men jag varnar dig — jag dricker snabbare än jag ser ut.' },
      ],
      'Angelina J|Idris E': [
        { sender: 'Angelina J', content: 'DJ OCH skådespelare? Berätta mer om Berlin-settet.' },
        { sender: 'Idris E', content: 'Tre timmar, bara house och techno. Publiken var med från start.' },
        { sender: 'Angelina J', content: 'Jag har dansat i Berlin. Det finns inget bättre ställe.' },
        { sender: 'Idris E', content: 'En kvinna med smak. Vad gör du här i Sverige då?' },
        { sender: 'Angelina J', content: 'Besöker. Kanske stannar. Beror på sällskapet.' },
        { sender: 'Idris E', content: 'Ska vi se till att sällskapet lever upp till förväntningarna?' },
      ],
      'Jennifer L|Chris H': [
        { sender: 'Chris H', content: 'Hej! Dansen på din profil — vilken stil dansar du?' },
        { sender: 'Jennifer L', content: 'Allt egentligen. Salsa, hip-hop, ballroom. Dans är dans.' },
        { sender: 'Chris H', content: 'Imponerande! Jag kan surfa men dansa är ett annat kapitel.' },
        { sender: 'Jennifer L', content: 'Surfbalansen hjälper faktiskt. Du lär dig snabbt, jag lovar.' },
        { sender: 'Chris H', content: 'Är det ett erbjudande om danslektioner?' },
        { sender: 'Jennifer L', content: 'Kan vara det. Beroende på hur bra elev du är.' },
      ],
      'Zoe S|Jason M': [
        { sender: 'Zoe S', content: 'Hawaiisk smed som surfar Pipe? Du låter som en film.' },
        { sender: 'Jason M', content: 'Haha det är verkligheten faktiskt. Vad gör en polyamorös Jersey-tjej här?' },
        { sender: 'Zoe S', content: 'Letar efter folk som förstår att kärlek inte är begränsad.' },
        { sender: 'Jason M', content: 'Det förstår jag helt. Öppenhet är allt.' },
        { sender: 'Zoe S', content: 'Bra. Ska vi träffas och snacka om det på riktigt?' },
      ],
    }

    const pairKey = `${nameA}|${nameB}`
    const script = chatScripts[pairKey]
    if (!script) {
      console.warn(`    ⚠️  No chat script for pair: ${pairKey}`)
      continue
    }

    const baseTime = Date.now() - 2 * 24 * 60 * 60 * 1000
    for (let i = 0; i < script.length; i++) {
      const { sender, content } = script[i]
      const senderId = userIdMap.get(sender)
      if (!senderId) continue
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId,
          content,
          type: 'TEXT',
          status: i < script.length - 1 ? 'READ' : 'DELIVERED',
          createdAt: new Date(baseTime + i * 5 * 60 * 1000),
        },
      })
    }

    console.log(`    ✓ Conversation: ${nameA} ↔ ${nameB} (${script.length} messages)`)
  }

  // ─── Samuel's test account: 5 matches with women, 3 with conversations ────

  const SAMUEL_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
  const samuelExists = await prisma.user.findUnique({ where: { id: SAMUEL_ID } })

  if (samuelExists) {
    console.log('\nSeeding Samuel\'s matches...')

    // 5 women who matched with Samuel (first 3 get conversations)
    const samuelMatches: Array<{ name: string; chat: boolean }> = [
      { name: 'Scarlett J', chat: true },
      { name: 'Rihanna', chat: true },
      { name: 'Florence P', chat: true },
      { name: 'Zendaya', chat: false },
      { name: 'Sydney S', chat: false },
    ]

    for (const { name, chat } of samuelMatches) {
      const celebId = userIdMap.get(name)
      if (!celebId) {
        console.warn(`  ⚠️  Could not find user: ${name}`)
        continue
      }

      // Mutual LIKE swipes
      await prisma.swipe.upsert({
        where: { userId_targetId: { userId: SAMUEL_ID, targetId: celebId } },
        update: {},
        create: { userId: SAMUEL_ID, targetId: celebId, action: 'LIKE' },
      })
      await prisma.swipe.upsert({
        where: { userId_targetId: { userId: celebId, targetId: SAMUEL_ID } },
        update: {},
        create: { userId: celebId, targetId: SAMUEL_ID, action: 'LIKE' },
      })

      // Match
      const [user1Id, user2Id] = [SAMUEL_ID, celebId].sort()
      const match = await prisma.match.upsert({
        where: { user1Id_user2Id: { user1Id, user2Id } },
        update: {},
        create: { user1Id, user2Id },
      })
      console.log(`  ✓ Match: Samuel ↔ ${name}`)

      if (!chat) continue

      // Conversation
      const conversation = await prisma.conversation.upsert({
        where: { matchId: match.id },
        update: {},
        create: { matchId: match.id },
      })

      await prisma.conversationParticipant.upsert({
        where: { conversationId_userId: { conversationId: conversation.id, userId: SAMUEL_ID } },
        update: {},
        create: { conversationId: conversation.id, userId: SAMUEL_ID },
      })
      await prisma.conversationParticipant.upsert({
        where: { conversationId_userId: { conversationId: conversation.id, userId: celebId } },
        update: {},
        create: { conversationId: conversation.id, userId: celebId },
      })

      // Skip if messages already exist
      const msgCount = await prisma.message.count({ where: { conversationId: conversation.id } })
      if (msgCount > 0) {
        console.log(`    ✓ Already has messages, skipping (Samuel ↔ ${name})`)
        continue
      }

      const samuelChats: Record<string, Array<{ sender: string; content: string }>> = {
        'Scarlett J': [
          { sender: 'Samuel', content: 'Hej! Jazz och whisky — du har bra smak.' },
          { sender: 'Scarlett J', content: 'Tack! Och du verkar ha bra omdöme. Vad dricker du helst?' },
          { sender: 'Samuel', content: 'Islay single malt om jag ska välja. Rökig och ärlig.' },
          { sender: 'Scarlett J', content: 'Rökig och ärlig. Beskriver det dig också?' },
          { sender: 'Samuel', content: 'Haha, det hoppas jag. Ska vi testa teorin över en drink?' },
          { sender: 'Scarlett J', content: 'Det kan vi absolut göra. Fredag?' },
        ],
        'Rihanna': [
          { sender: 'Rihanna', content: 'Hej! Gillade din profil. Vad gör du egentligen?' },
          { sender: 'Samuel', content: 'Bygger en app. Typ social plattform. Du då — fortfarande musik eller bara Fenty?' },
          { sender: 'Rihanna', content: 'Båda. Plus att vara mamma. Trippel combo. Din app — vad handlar den om?' },
          { sender: 'Samuel', content: 'Dejtning och community för folk som gillar att vara ärliga om vad de vill.' },
          { sender: 'Rihanna', content: 'Ärlighet? Sällsynt. Berätta mer över middag?' },
        ],
        'Florence P': [
          { sender: 'Florence P', content: 'Oxford-tjej möter svensk tech-kille. Intressant.' },
          { sender: 'Samuel', content: 'Haha jag är mer än tech. Lagar du fortfarande 4-rätters middagar för dig själv?' },
          { sender: 'Florence P', content: 'Alltid. Igår blev det risotto med tryffel. Ensam men inte ensam, om du förstår.' },
          { sender: 'Samuel', content: 'Förstår helt. Jag gör samma sak fast med enklare råvaror.' },
          { sender: 'Florence P', content: 'Vi kanske ska laga ihop nåt. Jag bjuder på tryffel, du bjuder på vin?' },
          { sender: 'Samuel', content: 'Deal. Söndag?' },
          { sender: 'Florence P', content: 'Söndag funkar perfekt. Skicka adress.' },
        ],
      }

      const script = samuelChats[name]
      if (!script) continue

      const baseTime = Date.now() - 1 * 24 * 60 * 60 * 1000 // 1 day ago
      for (let i = 0; i < script.length; i++) {
        const { sender, content } = script[i]
        const senderId = sender === 'Samuel' ? SAMUEL_ID : celebId
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId,
            content,
            type: 'TEXT',
            status: i < script.length - 1 ? 'READ' : 'DELIVERED',
            createdAt: new Date(baseTime + i * 8 * 60 * 1000), // 8 min apart
          },
        })
      }

      console.log(`    ✓ Conversation: Samuel ↔ ${name} (${script.length} messages)`)
    }

    console.log('✅ Samuel\'s matches seeded')
  } else {
    console.log('\n⚠️  Samuel test account not found, skipping matches')
  }

  // Clean up old dev users that are no longer in the list
  const currentNames = new Set(celebrities.map((c) => `dev-${c.displayName}`))
  const oldUsers = await prisma.user.findMany({
    where: {
      personnummer_hash: { startsWith: 'dev-' },
      NOT: { personnummer_hash: { in: [...currentNames] } },
    },
    select: { id: true, displayName: true },
  })
  for (const oldUser of oldUsers) {
    await prisma.user.delete({ where: { id: oldUser.id } })
    console.log(`  🗑 Removed old dev user: ${oldUser.displayName}`)
  }

  console.log('\n✅ Social graph seeded')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

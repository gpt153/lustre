/**
 * Dev seed: 20 celebrity-inspired test profiles
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
    'https://upload.wikimedia.org/wikipedia/commons/5/5e/Angelina_Jolie_2010_4.jpg',
  ],
  'Brad P': [
    'https://upload.wikimedia.org/wikipedia/commons/9/90/Brad_Pitt-69858.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/4c/Brad_Pitt_2019_by_Glenn_Francis.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/6/60/Brad_Pitt_2013.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/98/Brad_Pitt_in_2014_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/75/Brad_Pitt-69924.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/6/66/Brad_Pitt_2007.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/0/01/Brad_Pitt_2023.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c6/Brad_Pitt_at_81st_Venice_International_Film_Festival.jpg',
  ],
  'George C': [
    'https://upload.wikimedia.org/wikipedia/commons/7/7a/George_Clooney_Jay_Kelly-19_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/71/George_Clooney-69990.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/36/George_Clooney_2012.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/b/b7/George_Clooney-69993.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/10/George_Clooney-69761.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/8/8d/George_Clooney_2016.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e9/George_Clooney_at_81st_Venice_International_Film_Festival.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/92/George_Clooney-4_The_Men_Who_Stare_at_Goats_TIFF09_%28cropped%29.jpg',
  ],
  'Margot R': [
    'https://upload.wikimedia.org/wikipedia/commons/5/57/SYDNEY%2C_AUSTRALIA_-_JANUARY_23_Margot_Robbie_arrives_at_the_Australian_Premiere_of_%27I%2C_Tonya%27_on_January_23%2C_2018_in_Sydney%2C_Australia_%2828074883999%29_%28cropped_2%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/98/Margot_Robbie_at_Somerset_House_in_2013_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c5/Margot_Robbie_%2853012385004%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/2/26/Margot_Robbie_2016_cropped_and_retouched.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/0/0b/Margot_Robbie_%2828316659170%29_%28cropped%29.jpg',
  ],
  'Ryan G': [
    'https://upload.wikimedia.org/wikipedia/commons/6/62/GoslingBFI081223_%2822_of_30%29_%2853388157347%29_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f6/Ryan_Gosling_in_2018.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/78/Ryan_Gosling_%2817056601751%29_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/51/Ryan_Gosling_%2832240278291%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f0/Ryan_Gosling_%2816437257783%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/95/Ryan_Gosling_%2816869617648%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/46/Ryan_Gosling_Cannes_2014.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e6/Ryan_Gosling_by_Gage_Skidmore.jpg',
  ],
  'Jennifer L': [
    'https://upload.wikimedia.org/wikipedia/commons/6/6e/Jennifer_Lopez_at_the_2025_Sundance_Film_Festival_%28cropped_3%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c3/Jennifer_Lopez_at_GLAAD_Media_Awards.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/0/07/Jennifer_Lopez_at_GLAAD_Media_Awards_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/ea/Jennifer_Lopez_at_the_2025_Sundance_Film_Festival_1.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/7a/Jennifer_Lopez_at_the_2025_Sundance_Film_Festival_2.jpg',
  ],
  'Chris H': [
    'https://upload.wikimedia.org/wikipedia/commons/8/86/Chris_Hemsworth_-_Crime_101.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/6/69/Chris_Hemsworth_by_Gage_Skidmore_3.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/4c/Chris_Hemsworth_by_Gage_Skidmore.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e8/Chris_Hemsworth_by_Gage_Skidmore_2_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chris_Hemsworth_2018.jpg',
  ],
  'Zoe S': [
    'https://upload.wikimedia.org/wikipedia/commons/e/e1/Zoe_Salda%C3%B1a_at_the_2024_Toronto_International_Film_Festival_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/9c/Zoe_Saldana_at_the_2024_Toronto_International_Film_Festival_4.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/8/86/Zoe_Saldana_2013.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/31/Zoe_Saldana_by_Gage_Skidmore_3.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/3a/Zoe_Saldana_press_conference_Cannes_2024.jpg',
  ],
  'Leonardo D': [
    'https://upload.wikimedia.org/wikipedia/commons/2/2d/LeoPTABFI191125-28_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/54/Leonardo_DiCaprio_crop.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/46/Leonardo_Dicaprio_Cannes_2019.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/2/27/Leonardo_DiCaprio_by_David_Shankbone.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/8/80/Leonardo_DiCaprio_2002.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/fa/Leonardo_DiCaprio_2017.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/9a/Leonardo_DiCaprio_2010.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e4/Leonardo_DiCaprio_Berlinale_2010.jpg',
  ],
  'Charlize T': [
    'https://upload.wikimedia.org/wikipedia/commons/5/5d/Charlize-theron-IMG_6045.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/47/Charlize_Theron_%282019%29_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f3/Charlize_Theron_2005.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/47/Charlize_Theron_by_Gage_Skidmore.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/18/Charlize_Theron_2018.png',
  ],
  'Idris E': [
    'https://upload.wikimedia.org/wikipedia/commons/3/3a/Idris_Elba_A_House_of_Dynamite-21_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/d/d6/Idris_Elba-5272.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/0/0e/Idris_Elba-4580_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/b/b8/Idris_Elba_2014.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/3d/Idris_Elba_in_2024_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/53/Idris_Elba-4822.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/0/05/Idris_Elba_A_House_of_Dynamite-18.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/d/d3/Idris_Elba_at_SXSW_London_2025.jpg',
  ],
  'Eva M': [
    'https://upload.wikimedia.org/wikipedia/commons/1/11/Eva_Mendes_2009.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/fa/Eva_Rinaldi_Eva_Mendes_%2852509644038%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/ed/Eva_Mendes_%2852509627363%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/f8/Eva_Mendes_%2852509355049%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/b/b4/Eva_Mendes_%2852509643968%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/1c/Eva_Mendes_%2852509371854%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/73/Eva_Mendes_%2852509644088%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/2/2c/Eva_Mendes_%2852508600247%29.jpg',
  ],
  'Jason M': [
    'https://upload.wikimedia.org/wikipedia/commons/2/22/Jason_Momoa_%2843055621224%29_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e0/Jason_Momoa%2C_Aquaman_%2845655623114%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/d/d6/Jason_Momoa_by_Gage_Skidmore.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/58/Jason_Momoa_by_Gage_Skidmore_2.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/cb/Jason_momoa.jpg',
  ],
  'Priyanka C': [
    'https://upload.wikimedia.org/wikipedia/commons/4/45/Priyanka_Chopra_at_Bulgary_launch%2C_2024_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/57/Priyanka_Chopra_at_Filmfare_Awards_2013.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/36/Priyanka_Chopra_at_The_Sky_Is_Pink_Promotions.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/6/6c/Priyanka-chopra-gesf-2018-7565.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/fa/Priyanka_Chopra_at_an_event_for_Umang_2020_%2865%29.jpg',
  ],
  'Ryan R': [
    'https://upload.wikimedia.org/wikipedia/commons/1/14/Deadpool_2_Japan_Premiere_Red_Carpet_Ryan_Reynolds_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/96/Ryan_Reynolds_TIFF_2014.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/a/a3/Ryan_Reynolds_by_Gage_Skidmore_3.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/75/Ryan_Reynolds_by_Gage_Skidmore_4.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/a/aa/Ryan_Reynolds_2011.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/f/ff/Ryan_Reynolds%2C_2010_Buried_Premiere.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/4b/Ryan_Reynolds_at_TIFF_2014.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/b/b4/Ryan_Reynolds_2014_TIFF_The_Voices_Premiere.jpg',
  ],
  'Halle B': [
    'https://upload.wikimedia.org/wikipedia/commons/a/aa/Halle_Berry-1910.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/56/Halle_Berry_by_Gage_Skidmore_2.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/4f/Halle_Berry-0343.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/71/Halle_Berry_%2835990584381%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c4/Halle_Berry_-_TIFF_2012.jpg',
  ],
  'Tom H': [
    'https://upload.wikimedia.org/wikipedia/commons/1/14/Tom_Hardy_by_Gage_Skidmore_in_2018.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/45/Tom_Hardy.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/30/Tom_Hardy_Locke_Premiere.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/73/Tom_Hardy_Cannes_2015.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e2/2011_Tom_Hardy_TTSS_Premiere.jpg',
  ],
  'Lupita N': [
    "https://upload.wikimedia.org/wikipedia/commons/4/4c/Lupita_Nyong%27o_by_Gage_Skidmore_4.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/2/2c/Lupita_Nyong%27o%2C_by_Gordon_Correll_%28cropped%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/07/LupitaNyong%27oTIFFSept2013.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/e/e4/Lupita_Nyong%27o_%2853673310248%29_cropped.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/31/Lupita_Nyong%27o_by_Gage_Skidmore.jpg",
  ],
  'Henry C': [
    'https://upload.wikimedia.org/wikipedia/commons/3/30/Henry_Cavill_%2848417913146%29_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/d/d4/Henry_Cavill_by_Gage_Skidmore.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/55/Henry_Cavill_%282009%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/2/25/Henry_Cavill_%288463776101%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/7/71/Henry_Cavill_%2848418057502%29.jpg',
  ],
}

const celebrities = [
  {
    displayName: 'Scarlett J',
    age: 39,
    gender: 'WOMAN',
    orientation: 'BISEXUAL',
    relationshipType: 'SINGLE',
    seeking: ['DATING', 'CASUAL', 'PLAY_PARTNER'],
    contentPreference: 'OPEN',
    bio: 'Skådespelerska och sångerska från New York. Älskar jazz, yoga på taken i Manhattan och bra whisky. Direkt, rolig och vet vad jag vill.',
    spicyBio: 'Gillar att ta kontroll men kan överraskas. Fascinerad av sensorisk lek och mjuk dominans. Har en svaghet för rep och bra teknik.',
    kinks: ['Rope bondage', 'Blindfolds', 'Domination', 'Sensation play', 'Hair pulling'],
    photoCount: 5,
    posts: [
      'Manhattan på natten slår allt annat. Fin drink, bra sällskap.',
      'Yoga på taket ikväll. Solnedgången var absurd. 🌅',
      'Bra whisky och ännu bättre konversation. Vad mer behöver man?',
      'Återkommer alltid till jazz. Det säger något om en person om de förstår bebop.',
      'NYC — kärleksfullt hatad varje dag.',
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
    bio: 'Lever på mina egna villkor. Humanitärt arbete, konst och äventyr. Förälder och orolig optimist. Letar efter djup, inte yta.',
    spicyBio: 'Total power exchange är det som verkligen tänder mig. Litar på rätt person med allt. Har utforskat mycket och vet vad jag vill.',
    kinks: ['Total power exchange', 'Slave/Master', 'Wax play', 'Knife play', 'Biting'],
    photoCount: 6,
    posts: [
      'Precis hem från Kambodja. Varje resa påminner mig om hur litet mina problem faktiskt är.',
      'Konst är det enda språket som inte behöver översättning.',
      'Mina barn lär mig mer om livet varje dag än jag lärde dem.',
      'Ensamhet och frihet är inte samma sak, men de hänger ihop.',
      'Tatueringar är dagboken jag aldrig kan förlora.',
    ],
  },
  {
    displayName: 'Brad P',
    age: 60,
    gender: 'MAN',
    orientation: 'STRAIGHT',
    relationshipType: 'SINGLE',
    seeking: ['DATING', 'CASUAL', 'RELATIONSHIP'],
    contentPreference: 'OPEN',
    bio: 'Arkitektur, motorcyklar och keramik. Oklahomakille som aldrig riktigt lämnade LA men drömmer om Toscana. Förvånansvärt bra kock.',
    spicyBio: 'Gillar långsam uppbyggnad och ordentliga förspel. Fascinerad av voyeurism och ömsesidig utforskning. Tålmodig men intensiv.',
    kinks: ['Voyeurism', 'Tease and denial', 'Orgasm control', 'Sensation play', 'Ice play'],
    photoCount: 4,
    posts: [
      'Ny lerslöjdsession. Händerna smutsiga, huvudet tomt. Perfekt terapi.',
      'MC-tur längs PCH imorse. Ingenting slår det.',
      'Lagar pastarätten jag lärt mig i Bologna. Tredje försöket. Nästan.',
      'Arkitektur är det sättet vi berättar vad vi värdesätter — se bara på vad vi bygger.',
    ],
  },
  {
    displayName: 'George C',
    age: 62,
    gender: 'MAN',
    orientation: 'STRAIGHT',
    relationshipType: 'PARTNERED',
    seeking: ['FRIENDSHIP', 'NETWORKING', 'CASUAL'],
    contentPreference: 'SOFT',
    bio: 'Skådespelare, regissör, tequilabonde. Bor halva åren vid Comosjön. Charmerande nog att veta att charm är överskattad.',
    spicyBio: 'Klassisk och sofistikerad i allt, inklusive detta. Föredrar intensivt ögonkontakt och elegant dominans. Ingen brådska — kvalitet slår kvantitet.',
    kinks: ['Domination', 'Eye contact play', 'Tease and denial', 'Blindfolds', 'Protocol'],
    photoCount: 3,
    posts: [
      'Solnedgång vid Como. Casamigos i handen. Livet är okej.',
      'Varje gång jag tror Hollywood förvånat mig, gör den det igen.',
      'Lärde mig göra espresso ordentligt. Tre år sen. Fortfarande inte bra nog.',
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
    bio: 'Australienska i LA. Surfa, hockeyspela, festa och sedan ångra festen. Skrattar för högt och är stolt över det.',
    spicyBio: 'Vill ha roligt, punkt. Gillar rollspel och att vara lite oförutsägbar. Öppen för det mesta om det finns kemi och humor.',
    kinks: ['Role play', 'Spanking', 'Hair pulling', 'Teasing', 'Biting'],
    photoCount: 6,
    posts: [
      'Surfsessionen var kaotisk men jag stod upp tre gånger. Det räknas.',
      'Hockey med killarna. De låtsas fortfarande som att det inte är konstigt att jag är bättre.',
      'Australiensiska fester vs. LA-fester — ingen tävling.',
      'Ny roll, ny karaktär, nytt obsessivt tänkande varje natt kl 2.',
      'Perth kommer alltid att vara hem. LA är bara det ställe jag jobbar.',
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
    bio: 'Kanadensare i LA. Spelar piano, bygger möbler och läser för mycket. Lite allvarligare än jag ser ut, lite roligare än jag verkar.',
    spicyBio: 'Intensiv och fokuserad. Tänder på djup närvaro — vara helt i stunden. Gillar mjuk dominans och att verkligen se sin partner.',
    kinks: ['Sensation play', 'Eye contact play', 'Orgasm control', 'Collar and leash', 'Domination'],
    photoCount: 4,
    posts: [
      'Avslutade pianostycket jag jobbat på i fyra månader. Det låter fortfarande fel.',
      'Byggde en bokhylla. Den är inte rak. Jag är okej med det.',
      'Läste om Drive-boken. Fortfarande bättre än filmen. Filmen är fortfarande bra.',
      'Kanada på vintern slog aldrig mig som romantiskt förrän jag slutade bo där.',
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
    bio: 'Bronx-tjej som tog sig. Dansar, sjunger, producerar och orkar fortfarande. Tror på kärlek — möjligtvis för mycket. Arbetar på det.',
    spicyBio: 'Gillar att vara i fokus och att visa upp sig. Performativ av naturen — det gäller även i sovrummet. Vill ha någon som matchar energin.',
    kinks: ['Voyeurism', 'Exhibitionism', 'Role play', 'Domination', 'Forced orgasm'],
    photoCount: 7,
    posts: [
      'Dans är det enda som stänger av hjärnan helt. Är tacksam för det varje dag.',
      'Bronx aldrig lämnat mig, oavsett vart jag åkt.',
      'Nya albumet känns som ett tredje hjärta. Så personligt att det nästan gör ont.',
      'Träning kl 5 på morgonen. Kroppen hatar det. Hjärnan behöver det.',
      'Att tro på kärlek är inte naivt. Att inte lära sig av historien är det.',
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
    bio: 'Australiensare i Byron Bay. Surfa, träna och laga mat till familjen. Skratt är viktigare än status. Enorm men vänlig.',
    spicyBio: 'Gillar ömsesidig utforskning och är genuint nyfiken på sin partners njutning. Stark och mjuk på samma gång. Inga tabun med rätt person.',
    kinks: ['Impact Play', 'Spanking', 'Hair pulling', 'Biting', 'Orgasm control'],
    photoCount: 5,
    posts: [
      'Surfen var episk imorse. Byron Bay levererar alltid.',
      'Lagade ceviche med barnen. Det blev mer lek än mat. Bättre så.',
      'Träningspasset tog 2 timmar. Hade planerat 45 min. Så går det.',
      'Australien är en annan planet. Saknar det varje dag jag är borta.',
      'Skrattet är det enda som håller igång det här galenskapiga livet.',
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
    bio: 'Jersey City via Santo Domingo. Skådespelerska, mamma, eldsjäl. Polyamorös och stolt. Tror på ärlig kommunikation framför allt annat.',
    spicyBio: 'Erfaren och vet precis vad hon vill. Gillar sensorisk lek och mjuk dominans. Helt bekväm med komplicerade dynamiker.',
    kinks: ['Sensation play', 'Rope bondage', 'Power exchange', 'Wax play', 'Blindfolds'],
    photoCount: 5,
    posts: [
      'Polyamori handlar om kommunikation, inte om brist på kärlek. Tvärtom.',
      'Spelade rollspel för 10 timmar. Hjärnan är tom och jag är lycklig.',
      'Santo Domingo är alltid en del av mig. Kan höra musiken när jag stänger ögonen.',
      'Mina barn frågar de bästa frågorna. Ofta utan svar.',
      'Varje ny person du träffar öppnar ett rum du inte visste fanns.',
    ],
  },
  {
    displayName: 'Leonardo D',
    age: 49,
    gender: 'MAN',
    orientation: 'STRAIGHT',
    relationshipType: 'SINGLE',
    seeking: ['CASUAL', 'DATING', 'PLAY_PARTNER'],
    contentPreference: 'OPEN',
    bio: 'LA-kille med klimatoro. Segler, läser och samlar konst. Äntligen vuxen i femtioårsåldern. Säger det jag tänker och menar vad jag säger.',
    spicyBio: 'Gillar långsam intensitet och full uppmärksamhet. Fascinerad av tease and denial. Tålmodig och metodisk — i alla avseenden.',
    kinks: ['Tease and denial', 'Edging', 'Voyeurism', 'Sensation play', 'Orgasm control'],
    photoCount: 4,
    posts: [
      'Just tillbaka från Amazonas. Klimatkrisen är inte abstrakt när du ser den med egna ögon.',
      'Seglade från Monaco. Tog tre dagar. Kände varje timme.',
      'Ny konstsamling. Hittade ett verk av en okänd konstnär som slog alla kända.',
      'Lade ned aktivistrollen i 24h och läste bara en roman. Det behövdes.',
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
    bio: 'Sydafrikanskt ursprung, LA-hjärta. Skördar citroner, adoptivmamma och otrolig bilcourage. Mer nördig än jag ser ut.',
    spicyBio: 'Stark och oberäknelig i bästa mening. Gillar rollspel och att utforska gränser med förtroende. Dominant men lekfull.',
    kinks: ['Role play', 'Domination', 'Bondage', 'Spanking', 'Power exchange'],
    photoCount: 5,
    posts: [
      'Sydafrika är och förblir i mitt DNA. Besökte igår i tankarna, via en bra bok.',
      'Körde en Lamborghini på en öde väg. Det är terapi.',
      'Mina barn frågade varför jag jobbar. Jag svarade att det är det jag älskar. De köpte det.',
      'Stark kvinna = svårhanterlig kvinna. I allas huvud utom mitt.',
      'LA-solnedgångar är galet vackra. Även om de är lite för performativa.',
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
    photoCount: 4,
    posts: [
      'DJ-sett i Berlin igår. Publiken förstod det från ton ett. Det är allt jag vill.',
      'Hackney är fortfarande mer äkta än alla städer jag bott i.',
      'Skådespeleri och musik är samma sak — du sätter in hela dig och hoppas det räcker.',
      'Intensitet är inte aggression. Det är närvaro.',
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
    photoCount: 4,
    posts: [
      'Kuba är och förblir mitt hjärtas hemland. Besökte Miami imorse i en dröm.',
      'Mina barn pratar spanska bättre än jag idag. Kände mig stolt och gammal samtidigt.',
      'Ny tavla klar. Tog 6 veckor och 3 existenskriser.',
      'Solnedgången över Stilla havet. Varje gång. Aldrig rutin.',
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
    bio: 'Hawaiisk rötter, världsmedborgare. Surfa, smida, tatueringsnörd. Varm och välkomnande men respekterar gränser med precisionens kraft.',
    spicyBio: 'Livlig, öppen och äventyrlig. Gillar groupplay och exhibitionism. Naturlig kropp, naturlig energi — inga pretentioner.',
    kinks: ['Exhibitionism', 'Voyeurism', 'Group play', 'Bondage', 'Spanking'],
    photoCount: 7,
    posts: [
      'Smide i morgonljuset. Hörde ingenting utom hammarens slag och fåglarna.',
      'Hawaii — det är inte ett ställe, det är ett tillstånd.',
      'Ny tatuering klar. Tolfte. Eller trettionde. Tappar räkningen.',
      'Surfade Pipe imorse. Bodyn säger att jag är för gammal. Jag lyssnar inte.',
      'Öppenhet är styrka. Tar lång tid att förstå det, men när du gör — allt ändras.',
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
    bio: 'Desi-tjej som tagit hela världen. Producent, artist, skådespelerska. Gillar biryani och bourbon i lika delar. Söker djup, inte glitter.',
    spicyBio: 'Vill ha intensiv kontakt och djup närvaro. Stark Dominant/submissive-dynamik tilltalar henne. Gillar att bli sedd och att verkligen se.',
    kinks: ['Power exchange', 'Eye contact play', 'Bondage', 'Service submission', 'Sensation play'],
    photoCount: 6,
    posts: [
      'Mumbai vid soluppgången. Inget i världen luktar eller låter likadant.',
      'Producerade ett album, spelade in en serie, svarat på 400 mejl. Kallas det work-life balance nu?',
      'Biryani är kärlek. Bourbon är visdom. Båda behövs.',
      'Min mamma har fortfarande rätt om allt. Det är irriterande.',
      'Desi girl tar världen — men svarar fortfarande sin mamma varje kväll.',
    ],
  },
  {
    displayName: 'Ryan R',
    age: 47,
    gender: 'MAN',
    orientation: 'STRAIGHT',
    relationshipType: 'PARTNERED',
    seeking: ['CASUAL', 'FRIENDSHIP', 'NETWORKING'],
    contentPreference: 'SOFT',
    bio: 'Kanadensare i NY. Ironisk men hjärtlig. Driver ett tequilamärke och skrattar alltid åt sina egna skämt. Hundälskare. Bra på karaoke.',
    spicyBio: 'Lättsam och rolig även här. Gillar lekfullt rollspel och ett gott skratt under och efter. Inget dödaralvarligt.',
    kinks: ['Role play', 'Teasing', 'Spanking', 'Orgasm control', 'Voyeurism'],
    photoCount: 3,
    posts: [
      'Min hund dömer mig dagligen. Med rätta.',
      'Karaoke är inte roligt om du inte tar det på fullt allvar. Spelar Thunder av Imagine Dragons. Fullt allvar.',
      'Tequila-provning imorse. Det kallas "jobba".',
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
    bio: 'Cleveland-kvinna, Cleveland-hjärta. Boxar, mediterar och springer på stranden kl 5. Tror på andraakter. Och tredje.',
    spicyBio: 'Stark och vacker och vet om det. Gillar att utforska sin submissiva sida med rätt person. Förtroende är allting.',
    kinks: ['Submission', 'Rope bondage', 'Wax play', 'Blindfolds', 'Orgasm control'],
    photoCount: 5,
    posts: [
      'Boxade i en timme imorse. Ingenting rensar hjärnan som ett bra jab-cross-combination.',
      'Cleveland — folk glömmer alltid bort Cleveland. Det är deras förlust.',
      'Andraakter är bättre än förstanen. Tredje är bäst.',
      'Sprang 10k längs stranden. Kroppen ljög och sa det var enkelt.',
      '57 år. Aldrig känt mig starkare. Skriv upp det.',
    ],
  },
  {
    displayName: 'Tom H',
    age: 46,
    gender: 'MAN',
    orientation: 'BISEXUAL',
    relationshipType: 'SINGLE',
    seeking: ['CASUAL', 'PLAY_PARTNER', 'DATING'],
    contentPreference: 'EXPLICIT',
    bio: 'East Sheen-kille, Bronson-energi i kroppen. Hund-pappa (ett gäng). Tränar BJJ. Intensiv men lagom. Tatueringar och tekopp.',
    spicyBio: 'Intensiv och absolut hängiven när han väljer att vara det. Gillar power exchange åt båda håll. Erfaren inom D/s-dynamiker.',
    kinks: ['Power exchange', 'Domination', 'Submission', 'Rope bondage', 'Collar and leash'],
    photoCount: 5,
    posts: [
      'BJJ i tre timmar. Kroppen är en katastrof. Sinnet är kristallklart.',
      'Hundarna fick bestämma vart vi gick på promenaden. Vi var borta i två timmar.',
      'En kopp te och tystnad. Det är fredag och det räcker.',
      'Intensitet är inte samma sak som aggression. Det tar tid att lära sig skillnaden.',
      'London på morgonen är ett annat London. Lugnt och nästan vänligt.',
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
    bio: 'Kenya via Mexico City via New Haven. Skådespelerska och berättare. Älskar teater, litteratur och att laga ugali. Nyfiken på allt.',
    spicyBio: 'Pansseksuell och öppen för det mesta med rätt person. Gillar sensoriska upplevelser och djup emotionell kontakt. Inget är tabu om det är ömsesidigt.',
    kinks: ['Sensation play', 'Rope bondage', 'Blindfolds', 'Wax play', 'Role play'],
    photoCount: 5,
    posts: [
      'Nairobi vid soluppgången. Hjärtat expanderar varje gång.',
      'Läste Chimamanda Ngozi Adichie om. Fortfarande lika träffande.',
      'Lagade ugali för första gången på månader. Smakade som hem och sorg blandat.',
      'Teater är det enda forum där vi fortfarande lyssnar på varandra i timmar.',
      'Nyfikenhet är den enda superkraften som inte tar slut.',
    ],
  },
  {
    displayName: 'Henry C',
    age: 41,
    gender: 'MAN',
    orientation: 'STRAIGHT',
    relationshipType: 'SINGLE',
    seeking: ['DATING', 'RELATIONSHIP', 'CASUAL'],
    contentPreference: 'OPEN',
    bio: 'Jersey-gubbe med Witcher-energi. Tyngdlyftning, Warhammer och matlagnin. Nördare än rollen. Renässansman på gott och ont.',
    spicyBio: 'Stor, stark och förvånansvärt öm. Gillar att dominera men läser av sin partner minutiöst. Fysisk intensitet kombinerat med mjuk kontroll.',
    kinks: ['Domination', 'Bondage', 'Orgasm control', 'Spanking', 'Collar and leash'],
    photoCount: 5,
    posts: [
      'Warhammer-session i 6 timmar. Jag ångrar inget.',
      'Bänkpress PB idag. Kroppen håller.',
      'Lagade beef wellington. Tog 4 timmar. Värt varje minut.',
      'Jersey är underskattad. Alltid underskattad.',
      'The Witcher-boken är bättre. Det säger jag som spelade rollen.',
    ],
  },
]

async function main() {
  console.log('Seeding dev users...')

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

    // Posts (upsert by checking if they exist)
    const existingPosts = await prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: 'asc' },
    })

    for (let i = 0; i < celeb.posts.length; i++) {
      if (!existingPosts[i]) {
        const daysAgo = celeb.posts.length - i
        await prisma.post.create({
          data: {
            authorId: user.id,
            text: celeb.posts[i],
            createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 + Math.random() * 12 * 60 * 60 * 1000),
          },
        })
      }
    }

    console.log(`✓ ${celeb.displayName} (${(celebrityPhotos[celeb.displayName] ?? []).length} photos, ${celeb.posts.length} posts)`)
  }

  console.log(`\n✅ Seeded ${celebrities.length} dev users`)

  // ─── Social graph: swipes, matches, conversations, messages ───────────────

  console.log('\nSeeding social graph...')

  // Gather all user IDs by display name
  const allUsers = await prisma.user.findMany({
    where: { personnummer_hash: { startsWith: 'dev-' } },
    select: { id: true, displayName: true },
  })
  const userIdMap = new Map(allUsers.map((u) => [u.displayName, u.id]))

  // 10 mutual LIKE pairs that result in matches
  const matchPairs: Array<[string, string]> = [
    ['Scarlett J', 'Ryan G'],
    ['Margot R', 'Leonardo D'],
    ['Angelina J', 'Brad P'],
    ['Charlize T', 'Idris E'],
    ['Jennifer L', 'Chris H'],
    ['Zoe S', 'Jason M'],
    ['Priyanka C', 'Henry C'],
    ['Halle B', 'Tom H'],
    ['Eva M', 'George C'],
    ['Lupita N', 'Ryan R'],
  ]

  for (const [nameA, nameB] of matchPairs) {
    const userAId = userIdMap.get(nameA)
    const userBId = userIdMap.get(nameB)
    if (!userAId || !userBId) {
      console.warn(`⚠️  Could not find users for pair: ${nameA} / ${nameB}`)
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

    console.log(`✓ Match: ${nameA} ↔ ${nameB}`)

    // Conversation for the first 5 pairs
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
      console.log(`  ✓ Conversation already has messages, skipping (${nameA} ↔ ${nameB})`)
      continue
    }

    // Realistic Swedish messages per pair
    const chatScripts: Record<string, Array<{ sender: string; content: string }>> = {
      'Scarlett J|Ryan G': [
        { sender: 'Scarlett J', content: 'Hej! Såg att du spelar piano — det är rätt ovanligt.' },
        { sender: 'Ryan G', content: 'Haha, ja jag vet. Inte det coolaste konversationsämnet kanske?' },
        { sender: 'Scarlett J', content: 'Tvärtom. Jag är svag för händer som vet vad de gör 😄' },
        { sender: 'Ryan G', content: 'Nu måste jag fråga om du menar det bokstavligt eller bildligt?' },
        { sender: 'Scarlett J', content: 'Varför inte båda? Vad gör du på fredag?' },
      ],
      'Margot R|Leonardo D': [
        { sender: 'Margot R', content: 'Såg att du seglat från Monaco — hur var det?' },
        { sender: 'Leonardo D', content: 'Tre dagar, sol och inga telefoner. Bästa beslutet på länge.' },
        { sender: 'Margot R', content: 'Tre dagar utan telefon?! Du är antingen zen eller galen 😂' },
        { sender: 'Leonardo D', content: 'Antagligen lite av båda. Har du seglaterfaerenheter?' },
        { sender: 'Margot R', content: 'Jag surfar om det räknas? Havet är havet.' },
        { sender: 'Leonardo D', content: 'Det räknas definitivt. Vi kanske ska kombinera något.' },
      ],
      'Angelina J|Brad P': [
        { sender: 'Angelina J', content: 'Du gör keramik OCH motorcyklar. Det är en intressant kombination.' },
        { sender: 'Brad P', content: 'En för kontroll, en för att tappa den. Balansen är viktig 😄' },
        { sender: 'Angelina J', content: 'Det förstår jag faktiskt bättre än du tror.' },
        { sender: 'Brad P', content: 'Berätta mer om det. Jag är genuint nyfiken.' },
        { sender: 'Angelina J', content: 'Det kräver mer tid än en app. Träffas vi för kaffe?' },
        { sender: 'Brad P', content: 'Absolut. Jag vet ett ställe vid havet. Tisdag?' },
        { sender: 'Angelina J', content: 'Tisdag funkar. Jag ser fram emot det.' },
      ],
      'Charlize T|Idris E': [
        { sender: 'Idris E', content: 'Hej Charlize! Såg att du är från Sydafrika — var är du från?' },
        { sender: 'Charlize T', content: 'Benoni, nära Johannesburg. Och du är från London?' },
        { sender: 'Idris E', content: 'Hackney, östra London. Inte exakt glamoröst men det formade mig.' },
        { sender: 'Charlize T', content: 'Äkta bakgrunder är alltid mer intressanta än glamour 😊' },
        { sender: 'Idris E', content: 'Exakt min filosofi. Vad gör du här i LA?' },
        { sender: 'Charlize T', content: 'Jobbet. Och nu kanske lite äventyr. Du?' },
        { sender: 'Idris E', content: 'Samma. Ska vi ta en drink och se vart det leder?' },
        { sender: 'Charlize T', content: 'Det låter faktiskt riktigt bra. Fredag?' },
      ],
      'Jennifer L|Chris H': [
        { sender: 'Chris H', content: 'Hej! Dansen på din profil — vilken stil dansar du?' },
        { sender: 'Jennifer L', content: 'Allt egentligen. Salsa, hip-hop, ballroom. Dans är dans.' },
        { sender: 'Chris H', content: 'Imponerande! Jag kan surfa men dansa är ett annat kapitel 😅' },
        { sender: 'Jennifer L', content: 'Surfbalansen hjälper faktiskt. Du lär dig snabbt, jag lovar.' },
        { sender: 'Chris H', content: 'Är det ett erbjudande om danslektioner?' },
        { sender: 'Jennifer L', content: 'Kan vara det. Beroende på hur bra elev du är 😉' },
      ],
    }

    const pairKey = `${nameA}|${nameB}`
    const script = chatScripts[pairKey]
    if (!script) {
      console.warn(`  ⚠️  No chat script for pair: ${pairKey}`)
      continue
    }

    const baseTime = Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days ago
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
          createdAt: new Date(baseTime + i * 5 * 60 * 1000), // 5 min apart
        },
      })
    }

    console.log(`  ✓ Conversation seeded: ${nameA} ↔ ${nameB} (${script.length} messages)`)
  }

  console.log('\n✅ Social graph seeded')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

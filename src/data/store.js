// In-memory data store for the Nightly CRM dashboard demo.
// Seeded once at boot with realistic talents, buyers and booking requests
// representing the B2B operational backbone of the nightlife industry.

export const TALENT_TYPES = ["dj", "photographe", "videaste"];
export const BOOKING_STATUSES = ["en_attente", "confirme", "urgence", "termine"];
export const BUYER_TYPES = ["club", "bar", "organisateur"];

const CITIES = [
  "Paris", "Lyon", "Marseille", "Bordeaux", "Lille", "Toulouse",
  "Nice", "Nantes", "Strasbourg", "Montpellier",
];

const DJ_ALIASES = [
  "DJ Nova", "DJ Kalyps", "Miss Vertigo", "DJ Aether", "Selecta Yuna",
  "DJ Mirage", "Warehouse Nyx", "DJ Solstice", "Baseline Rey", "DJ Cassiopee",
  "Night Rex", "DJ Lumen", "Studio 22", "DJ Odessa", "Krypto Faye",
  "DJ Ombre", "DJ Velvet", "Low End Theo", "DJ Prism", "Nocturna B2B",
];

const DJ_STYLES = [
  "House", "Techno", "Afro House", "Hip-Hop / RnB", "Electro Pop",
  "Minimal / Deep House", "Disco / Funk", "Reggaeton / Latino",
  "Drum & Bass", "Open Format",
];

const PHOTO_STYLES = [
  "Evenementiel nocturne", "Portrait backstage", "Reportage clubbing",
  "Mode & editorial", "Concert live",
];

const VIDEO_STYLES = [
  "Aftermovie", "Clip live", "Reels reseaux sociaux",
  "Teaser evenementiel", "Interview backstage",
];

const FIRST_NAMES = [
  "Camille", "Lucas", "Emma", "Nathan", "Chloe", "Louis", "Manon", "Hugo",
  "Ines", "Gabriel", "Sarah", "Adam", "Lea", "Jules", "Zoe", "Arthur",
  "Alice", "Raphael", "Julia", "Mathis", "Oceane", "Tom", "Clara", "Noah",
];

const LAST_NAMES = [
  "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit",
  "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel",
  "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fontaine",
];

const PHOTO_BRANDS = ["Studio", "Objectif Nuit", "Reportage", "Clichés"];
const VIDEO_BRANDS = ["Films", "Prod", "Aftermovie Studio", "Motion"];

const CLUB_NAMES = [
  "Le Nocturne", "Bassment Club", "Warehouse District", "Le Diamant Noir",
  "La Rotonde Underground", "Kollectif Nuit Blanche", "Le Sunset Social Club",
  "Blackout Club", "La Sirene Electrique", "Le Repaire",
];

const BAR_NAMES = [
  "Bar Mirage", "Rooftop 21", "Le Velvet Lounge", "Le Comptoir Nocturne",
  "Bar Satellite", "L'Alcove", "Le Speakeasy 8", "Bar Zenith",
];

const ORGA_NAMES = [
  "Pulse Events", "Nightline Productions", "Collectif Aurora", "Off The Grid Events",
  "Halo Organisation", "Kaleido Events", "Full Moon Collective", "Reverb Agency",
];

const NOTES_TEMPLATES = [
  "Client fidele, remet toujours ca l'annee suivante.",
  "Premiere collaboration, tres bon retour de la salle.",
  "Demande recurrente pour les soirees a theme.",
  "A confirmer le materiel technique sur place.",
  "Budget serre mais bonne visibilite pour le talent.",
  "Prevoir un backup en cas d'annulation tardive.",
];

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

const rand = seededRandom(20240517);

function pick(list) {
  return list[Math.floor(rand() * list.length)];
}

function randomInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  const value = rand() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

// --- Weekend window helper -------------------------------------------------
// Groups Friday 00:00 -> Sunday 23:59:59 of the *current* calendar week as
// "this weekend", regardless of which day "now" falls on.
export function getWeekendRange(reference = new Date()) {
  const now = new Date(reference);
  const jsDay = now.getDay(); // 0 = Sunday ... 6 = Saturday
  const mondayIndex = (jsDay + 6) % 7; // 0 = Monday ... 6 = Sunday

  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - mondayIndex);

  const weekendStart = new Date(weekStart);
  weekendStart.setDate(weekStart.getDate() + 4); // Friday 00:00

  const weekendEnd = new Date(weekStart);
  weekendEnd.setDate(weekStart.getDate() + 6);
  weekendEnd.setHours(23, 59, 59, 999); // Sunday 23:59:59

  return { start: weekendStart.getTime(), end: weekendEnd.getTime() };
}

export function isToday(timestamp, reference = new Date()) {
  const day = new Date(timestamp);
  const now = new Date(reference);
  return (
    day.getFullYear() === now.getFullYear() &&
    day.getMonth() === now.getMonth() &&
    day.getDate() === now.getDate()
  );
}

function randomTimestampBetween(startMs, endMs) {
  return Math.floor(startMs + rand() * (endMs - startMs));
}

// --- Talents -----------------------------------------------------------------

function buildTalentIdentity(type, index) {
  if (type === "dj") {
    const alias = DJ_ALIASES[index % DJ_ALIASES.length];
    return { name: alias, handle: slugify(alias) };
  }

  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const brand = type === "photographe" ? pick(PHOTO_BRANDS) : pick(VIDEO_BRANDS);
  const name = rand() > 0.5 ? `${firstName} ${lastName}` : `${brand} ${lastName}`;
  return { name, handle: slugify(`${firstName}${lastName}${index}`) };
}

function buildPortfolio(type, name) {
  if (type === "dj") {
    return [
      { title: "Warehouse Session - Peak Time", cover: "🎚️" },
      { title: `B2B avec ${pick(DJ_ALIASES)}`, cover: "🎧" },
      { title: "Boiler-style set - Rooftop", cover: "🔊" },
    ];
  }
  if (type === "photographe") {
    return [
      { title: "Soiree Halloween - Reportage complet", cover: "📸" },
      { title: "Backstage artistes - Festival", cover: "🖤" },
      { title: "Portraits ambiance neon", cover: "✨" },
    ];
  }
  return [
    { title: "Aftermovie - Nuit blanche edition", cover: "🎬" },
    { title: "Clip live - Main stage", cover: "🎥" },
    { title: "Reels teaser - Soiree VIP", cover: "📱" },
  ];
}

function buildBio(type, name, style, city) {
  if (type === "dj") {
    return `${name} enflamme les dancefloors de ${city} avec un set ${style.toLowerCase()}, entre selection pointue et lecture de la foule.`;
  }
  if (type === "photographe") {
    return `Photographe basé(e) à ${city}, spécialisé(e) en ${style.toLowerCase()}. Capture l'énergie de la nuit sans jamais gêner l'événement.`;
  }
  return `Vidéaste basé(e) à ${city}, expert(e) en ${style.toLowerCase()}. Livraison rapide, montage dynamique calibré pour les réseaux sociaux.`;
}

function tarifRange(type) {
  if (type === "dj") return [300, 1500];
  if (type === "photographe") return [200, 800];
  return [250, 1000];
}

function createTalents(count) {
  const talents = [];
  const now = Date.now();

  for (let i = 0; i < count; i += 1) {
    const roll = rand();
    const type = roll < 0.45 ? "dj" : roll < 0.75 ? "photographe" : "videaste";
    const style = type === "dj" ? pick(DJ_STYLES) : type === "photographe" ? pick(PHOTO_STYLES) : pick(VIDEO_STYLES);
    const city = pick(CITIES);
    const { name, handle } = buildTalentIdentity(type, i);
    const [minTarif, maxTarif] = tarifRange(type);
    const tarif = randomInt(minTarif, maxTarif);
    const note = randomFloat(3.5, 5, 1);
    const reviewsCount = randomInt(5, 130);
    const availableTonight = rand() < 0.22;
    const status = rand() < 0.92 ? "actif" : "inactif";
    const createdAt = now - randomInt(1, 400) * 24 * 60 * 60 * 1000;

    const talent = {
      id: `talent_${(i + 1).toString().padStart(4, "0")}`,
      name,
      type,
      style,
      city,
      tarif,
      tarifLabel: `à partir de ${tarif} €/soirée`,
      note,
      reviewsCount,
      bio: buildBio(type, name, style, city),
      instagram: `@${handle}`,
      mixcloud: type === "dj" ? `mixcloud.com/${handle}` : null,
      portfolioUrl: type === "dj" ? `mixcloud.com/${handle}` : type === "photographe" ? `behance.net/${handle}` : `vimeo.com/${handle}`,
      portfolio: buildPortfolio(type, name),
      availableTonight,
      status,
      createdAt,
    };

    talents.push(talent);
  }

  return talents.sort((a, b) => b.note - a.note);
}

// --- Buyers ------------------------------------------------------------------

function createBuyers(count) {
  const buyers = [];

  for (let i = 0; i < count; i += 1) {
    const roll = rand();
    const type = roll < 0.45 ? "club" : roll < 0.75 ? "bar" : "organisateur";
    const name = type === "club" ? pick(CLUB_NAMES) : type === "bar" ? pick(BAR_NAMES) : pick(ORGA_NAMES);
    const city = pick(CITIES);
    const contactFirst = pick(FIRST_NAMES);
    const contactLast = pick(LAST_NAMES);

    buyers.push({
      id: `buyer_${(i + 1).toString().padStart(4, "0")}`,
      name,
      type,
      city,
      contactName: `${contactFirst} ${contactLast}`,
      email: `contact@${slugify(name)}.com`,
      phone: `+33 6 ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
    });
  }

  return buyers;
}

// --- Bookings ----------------------------------------------------------------

const TIME_SLOTS = [
  "20h00 - 00h00", "22h00 - 02h00", "23h00 - 05h00", "00h00 - 04h00", "19h00 - 23h00",
];

function budgetFor(talent) {
  const variance = randomInt(-50, 250);
  return Math.max(100, talent.tarif + variance);
}

function buildBooking(index, talent, buyer, eventDate, status) {
  return {
    id: `booking_${(index + 1).toString().padStart(4, "0")}`,
    talentId: talent.id,
    talentName: talent.name,
    talentType: talent.type,
    buyerId: buyer.id,
    buyerName: buyer.name,
    city: buyer.city,
    eventDate,
    timeSlot: pick(TIME_SLOTS),
    budget: budgetFor(talent),
    status,
    notes: pick(NOTES_TEMPLATES),
    createdAt: eventDate - randomInt(1, 20) * 24 * 60 * 60 * 1000,
  };
}

function createBookings(talents, buyers, count) {
  const bookings = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const { start: weekendStart, end: weekendEnd } = getWeekendRange(new Date(now));

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  let index = 0;

  // 1) Urgent replacement alerts happening tonight.
  const urgentTonightCount = 5;
  for (let i = 0; i < urgentTonightCount; i += 1) {
    const talent = pick(talents);
    const buyer = pick(buyers);
    const eventDate = randomTimestampBetween(Math.max(now, todayStart.getTime()), todayEnd.getTime());
    bookings.push(buildBooking(index, talent, buyer, eventDate, "urgence"));
    index += 1;
  }

  // 2) Bookings happening this weekend (confirmed or still pending).
  const weekendCount = 14;
  for (let i = 0; i < weekendCount; i += 1) {
    const talent = pick(talents);
    const buyer = pick(buyers);
    const eventDate = randomTimestampBetween(weekendStart, weekendEnd);
    const status = rand() < 0.65 ? "confirme" : "en_attente";
    bookings.push(buildBooking(index, talent, buyer, eventDate, status));
    index += 1;
  }

  // 3) Past bookings, mostly wrapped up (feeds the revenue total).
  const pastCount = 18;
  for (let i = 0; i < pastCount; i += 1) {
    const talent = pick(talents);
    const buyer = pick(buyers);
    const eventDate = now - randomInt(1, 45) * dayMs;
    const status = rand() < 0.85 ? "termine" : "urgence";
    bookings.push(buildBooking(index, talent, buyer, eventDate, status));
    index += 1;
  }

  // 4) Other upcoming requests, spread over the next month.
  while (bookings.length < count) {
    const talent = pick(talents);
    const buyer = pick(buyers);
    const eventDate = now + randomInt(1, 35) * dayMs;
    const status = rand() < 0.5 ? "en_attente" : "confirme";
    bookings.push(buildBooking(index, talent, buyer, eventDate, status));
    index += 1;
  }

  return bookings.sort((a, b) => a.eventDate - b.eventDate);
}

export const talents = createTalents(48);
export const buyers = createBuyers(20);
export const bookings = createBookings(talents, buyers, 55);

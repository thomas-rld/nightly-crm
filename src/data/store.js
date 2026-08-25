// In-memory data store for the CRM dashboard demo.
// Seeded once at boot with realistic leads and agent events.

const STATUSES = ["new", "contacted", "qualified", "converted", "lost"];

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

const COMPANIES = [
  "Nimbus Cloud", "Aurora Robotics", "Fintra Labs", "Solara Energy",
  "Quantix Analytics", "Vertex Biotech", "Pixelforge Studio", "Northwind Logistics",
  "Bluewave Media", "Cobalt Systems", "Ionix Manufacturing", "Cedar Financial",
  "Meridian Health", "Orbital Software", "Terraform Realty", "Lumen Networks",
];

const SOURCES = [
  "site web", "webinaire", "salon professionnel", "recommandation",
  "campagne email", "reseaux sociaux", "publicite payante", "partenaire",
];

const EVENT_TYPES = [
  {
    type: "lead.created",
    message: (lead) => `Nouveau prospect capté : ${lead.name} (${lead.company})`,
  },
  {
    type: "lead.enriched",
    message: (lead) => `Fiche enrichie automatiquement pour ${lead.name}`,
  },
  {
    type: "lead.scored",
    message: (lead) => `Score IA recalculé pour ${lead.name}`,
  },
  {
    type: "email.sent",
    message: (lead) => `Email de qualification envoye a ${lead.name}`,
  },
  {
    type: "lead.qualified",
    message: (lead) => `${lead.name} marque comme qualifie par l'agent`,
  },
  {
    type: "meeting.scheduled",
    message: (lead) => `Rendez-vous propose a ${lead.name}`,
  },
  {
    type: "lead.status_changed",
    message: (lead) => `Statut de ${lead.name} mis a jour`,
  },
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

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function buildMetadata(lead, index) {
  return {
    utm: {
      source: pick(SOURCES),
      campaign: `campagne-${2024}-${String(randomInt(1, 12)).padStart(2, "0")}`,
      medium: pick(["organic", "cpc", "referral", "email", "social"]),
    },
    enrichment: {
      companySize: pick(["1-10", "11-50", "51-200", "201-1000", "1000+"]),
      industry: pick([
        "SaaS", "Sante", "Finance", "Industrie", "Energie", "Media", "Logistique",
      ]),
      linkedin: `https://linkedin.com/in/${slugify(lead.name)}${index}`,
      website: `https://${slugify(lead.company)}.com`,
    },
    aiScoring: {
      score: lead.score,
      confidence: Math.round(rand() * 40 + 60),
      signals: [
        pick(["a visite la page tarifs", "a telecharge un livre blanc", "a ouvert 3 emails"]),
        pick(["a assiste au webinaire", "a demande une demo", "a interagi sur LinkedIn"]),
      ],
    },
    activity: {
      lastContact: new Date(lead.createdAt).toISOString(),
      touchpoints: randomInt(1, 12),
      notes: pick([
        "Interesse par le plan Enterprise.",
        "Souhaite un suivi apres son comite budgetaire.",
        "Demande une integration avec son CRM existant.",
        "En attente de validation interne.",
        "Tres reactif, a relancer rapidement.",
      ]),
    },
  };
}

function createLeads(count) {
  const leads = [];
  const now = Date.now();

  for (let i = 0; i < count; i += 1) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const company = pick(COMPANIES);
    const daysAgo = i < 5 ? 0 : randomInt(0, 45);
    const hoursAgo = randomInt(0, 23);
    const minutesAgo = randomInt(0, 59);
    const createdAt = now - (daysAgo * 24 * 60 * 60 * 1000 + hoursAgo * 60 * 60 * 1000 + minutesAgo * 60 * 1000);
    const status = i < 5 ? "new" : pick(STATUSES);
    const score = randomInt(20, 99);

    const lead = {
      id: `lead_${(i + 1).toString().padStart(4, "0")}`,
      name,
      email: `${slugify(firstName)}.${slugify(lastName)}@${slugify(company)}.com`,
      company,
      phone: `+33 6 ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
      status,
      source: pick(SOURCES),
      score,
      createdAt,
      updatedAt: createdAt + randomInt(0, 6) * 60 * 60 * 1000,
    };

    lead.metadata = buildMetadata(lead, i);
    leads.push(lead);
  }

  return leads.sort((a, b) => b.createdAt - a.createdAt);
}

function createEvents(leads, count) {
  const events = [];
  const now = Date.now();

  for (let i = 0; i < count; i += 1) {
    const lead = pick(leads);
    const eventDef = pick(EVENT_TYPES);
    const minutesAgo = i === 0 ? 0 : randomInt(i * 4, i * 4 + 90);

    events.push({
      id: `evt_${(i + 1).toString().padStart(4, "0")}`,
      type: eventDef.type,
      leadId: lead.id,
      leadName: lead.name,
      message: eventDef.message(lead),
      createdAt: now - minutesAgo * 60 * 1000,
      payload: {
        leadId: lead.id,
        status: lead.status,
        source: lead.source,
        agent: pick(["agent-scout", "agent-scoring", "agent-outreach", "agent-scheduler"]),
      },
    });
  }

  return events.sort((a, b) => b.createdAt - a.createdAt);
}

export const STATUS_LIST = STATUSES;

export const leads = createLeads(64);
export const agentEvents = createEvents(leads, 45);

export function addAgentEvent(event) {
  agentEvents.unshift({
    id: `evt_${(agentEvents.length + 1).toString().padStart(4, "0")}`,
    createdAt: Date.now(),
    ...event,
  });
}

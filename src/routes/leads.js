import { leads, STATUS_LIST } from "../data/store.js";

function matchesQuery(lead, query) {
  if (!query) return true;
  const haystack = `${lead.name} ${lead.email} ${lead.company}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default async function leadsRoutes(fastify) {
  fastify.get("/api/leads", async (request, reply) => {
    const { status, q } = request.query;

    if (status && status !== "all" && !STATUS_LIST.includes(status)) {
      return reply.code(400).send({
        error: "invalid_status",
        message: `Statut invalide. Valeurs possibles : ${STATUS_LIST.join(", ")}`,
      });
    }

    const filtered = leads
      .filter((lead) => (!status || status === "all" ? true : lead.status === status))
      .filter((lead) => matchesQuery(lead, q))
      .sort((a, b) => b.createdAt - a.createdAt);

    return {
      total: filtered.length,
      statuses: STATUS_LIST,
      leads: filtered,
    };
  });

  fastify.get("/api/leads/:id", async (request, reply) => {
    const lead = leads.find((item) => item.id === request.params.id);
    if (!lead) {
      return reply.code(404).send({ error: "not_found", message: "Prospect introuvable" });
    }
    return lead;
  });
}

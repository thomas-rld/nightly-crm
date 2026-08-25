import { talents, TALENT_TYPES } from "../data/store.js";

function matchesQuery(talent, query) {
  if (!query) return true;
  const haystack = `${talent.name} ${talent.style} ${talent.city}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default async function talentsRoutes(fastify) {
  fastify.get("/api/talents", async (request, reply) => {
    const { type, q, availableTonight } = request.query;

    if (type && type !== "all" && !TALENT_TYPES.includes(type)) {
      return reply.code(400).send({
        error: "invalid_type",
        message: `Métier invalide. Valeurs possibles : ${TALENT_TYPES.join(", ")}`,
      });
    }

    const onlyTonight = availableTonight === "true" || availableTonight === "1";

    const filtered = talents
      .filter((talent) => (!type || type === "all" ? true : talent.type === type))
      .filter((talent) => (onlyTonight ? talent.availableTonight : true))
      .filter((talent) => matchesQuery(talent, q))
      .sort((a, b) => b.note - a.note);

    return {
      total: filtered.length,
      types: TALENT_TYPES,
      talents: filtered,
    };
  });

  fastify.get("/api/talents/:id", async (request, reply) => {
    const talent = talents.find((item) => item.id === request.params.id);
    if (!talent) {
      return reply.code(404).send({ error: "not_found", message: "Talent introuvable" });
    }
    return talent;
  });
}

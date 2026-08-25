import { agentEvents } from "../data/store.js";

export default async function eventsRoutes(fastify) {
  fastify.get("/api/events", async () => {
    const latest = [...agentEvents]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20);

    return {
      total: latest.length,
      events: latest,
    };
  });
}

import { leads, STATUS_LIST } from "../data/store.js";

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

export default async function statsRoutes(fastify) {
  fastify.get("/api/stats", async () => {
    const todayStart = startOfToday();

    const byStatus = STATUS_LIST.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    let todayLeads = 0;

    for (const lead of leads) {
      byStatus[lead.status] = (byStatus[lead.status] ?? 0) + 1;
      if (lead.createdAt >= todayStart) {
        todayLeads += 1;
      }
    }

    return {
      totalLeads: leads.length,
      todayLeads,
      byStatus,
      updatedAt: Date.now(),
    };
  });
}

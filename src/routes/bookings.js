import { bookings, BOOKING_STATUSES } from "../data/store.js";

const STATUS_PRIORITY = {
  urgence: 0,
  en_attente: 1,
  confirme: 2,
  termine: 3,
};

function matchesQuery(booking, query) {
  if (!query) return true;
  const haystack = `${booking.talentName} ${booking.buyerName} ${booking.city}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default async function bookingsRoutes(fastify) {
  fastify.get("/api/bookings", async (request, reply) => {
    const { status, q } = request.query;

    if (status && status !== "all" && !BOOKING_STATUSES.includes(status)) {
      return reply.code(400).send({
        error: "invalid_status",
        message: `Statut invalide. Valeurs possibles : ${BOOKING_STATUSES.join(", ")}`,
      });
    }

    const filtered = bookings
      .filter((booking) => (!status || status === "all" ? true : booking.status === status))
      .filter((booking) => matchesQuery(booking, q))
      .sort((a, b) => {
        const priorityDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
        if (priorityDiff !== 0) return priorityDiff;
        return a.eventDate - b.eventDate;
      });

    return {
      total: filtered.length,
      statuses: BOOKING_STATUSES,
      bookings: filtered,
    };
  });

  fastify.get("/api/bookings/:id", async (request, reply) => {
    const booking = bookings.find((item) => item.id === request.params.id);
    if (!booking) {
      return reply.code(404).send({ error: "not_found", message: "Demande de booking introuvable" });
    }
    return booking;
  });
}

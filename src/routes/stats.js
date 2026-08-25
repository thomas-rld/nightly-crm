import { talents, bookings, TALENT_TYPES, BOOKING_STATUSES, getWeekendRange, isToday } from "../data/store.js";

export default async function statsRoutes(fastify) {
  fastify.get("/api/stats", async () => {
    const now = new Date();
    const { start: weekendStart, end: weekendEnd } = getWeekendRange(now);

    const byTalentType = TALENT_TYPES.reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {});

    const byBookingStatus = BOOKING_STATUSES.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    let activeTalents = 0;
    for (const talent of talents) {
      byTalentType[talent.type] = (byTalentType[talent.type] ?? 0) + 1;
      if (talent.status === "actif") activeTalents += 1;
    }

    let bookingsThisWeekend = 0;
    let urgentAlertsTonight = 0;
    let totalRevenue = 0;

    for (const booking of bookings) {
      byBookingStatus[booking.status] = (byBookingStatus[booking.status] ?? 0) + 1;

      if (booking.eventDate >= weekendStart && booking.eventDate <= weekendEnd) {
        bookingsThisWeekend += 1;
      }

      if (booking.status === "urgence" && isToday(booking.eventDate, now)) {
        urgentAlertsTonight += 1;
      }

      if (booking.status === "confirme" || booking.status === "termine") {
        totalRevenue += booking.budget;
      }
    }

    return {
      activeTalents,
      totalTalents: talents.length,
      bookingsThisWeekend,
      urgentAlertsTonight,
      totalRevenue,
      byTalentType,
      byBookingStatus,
      updatedAt: Date.now(),
    };
  });
}

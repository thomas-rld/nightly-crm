import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";

import talentsRoutes from "./routes/talents.js";
import bookingsRoutes from "./routes/bookings.js";
import statsRoutes from "./routes/stats.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const fastify = Fastify({ logger: true });

// Serves everything under /public directly at the root (index.html, app.js, ...).
await fastify.register(fastifyStatic, {
  root: publicDir,
  index: "index.html",
});

await fastify.register(talentsRoutes);
await fastify.register(bookingsRoutes);
await fastify.register(statsRoutes);

fastify.get("/", (request, reply) => {
  return reply.sendFile("index.html");
});

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

try {
  await fastify.listen({ port: PORT, host: HOST });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

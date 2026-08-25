import Fastify from "fastify";
import { config } from "./config.js";
import { agentWebhookRoutes } from "./routes/agentWebhook.js";

const fastify = Fastify({
  logger: true,
});

fastify.get("/health", async () => ({ status: "ok" }));

await fastify.register(agentWebhookRoutes);

try {
  await fastify.listen({ port: config.PORT, host: config.HOST });
} catch (error) {
  fastify.log.error(error);
  process.exit(1);
}

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Fastify from "fastify";
import { config } from "./config.js";
import { agentWebhookRoutes } from "./routes/agentWebhook.js";

const fastify = Fastify({
  logger: true,
  trustProxy: true,
});

fastify.get("/", async (_request, reply) => {
  try {
    const html = await readFile(join(process.cwd(), "index.html"), "utf8");
    return reply.type("text/html; charset=utf-8").send(html);
  } catch {
    return reply.code(404).send({ error: "index.html introuvable" });
  }
});

fastify.get("/favicon.ico", async (_request, reply) => reply.code(204).send());

fastify.get("/health", async () => ({ status: "ok" }));

await fastify.register(agentWebhookRoutes);

export default fastify;

const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
  try {
    await fastify.listen({ port: config.PORT, host: config.HOST });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Fastify from "fastify";
import { config } from "./src/config.js";
import { agentWebhookRoutes } from "./src/routes/agentWebhook.js";

const app = Fastify({
  logger: true,
  trustProxy: true,
});

app.get("/", async (_request, reply) => {
  try {
    const html = await readFile(join(process.cwd(), "index.html"), "utf8");
    return reply.type("text/html; charset=utf-8").send(html);
  } catch {
    return reply.code(404).send({ error: "index.html introuvable" });
  }
});

app.get("/favicon.ico", async (_request, reply) => reply.code(204).send());

app.get("/health", async () => ({ status: "ok" }));

app.register(agentWebhookRoutes);

export default app;

app.listen({ port: config.PORT, host: config.HOST });

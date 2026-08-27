import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import { agentWebhookRoutes } from "./routes/agentWebhook.js";

const indexHtmlPath = join(dirname(fileURLToPath(import.meta.url)), "..", "index.html");

const app = Fastify({
  logger: true,
  trustProxy: true,
});

app.get("/", async (_request, reply) => {
  try {
    const html = await readFile(indexHtmlPath, "utf8");
    return reply.type("text/html; charset=utf-8").send(html);
  } catch {
    return reply.code(404).send({ error: "index.html introuvable" });
  }
});

app.get("/favicon.ico", async (_request, reply) => reply.code(204).send());

app.get("/health", async () => ({ status: "ok" }));

await app.register(agentWebhookRoutes);

export default app;

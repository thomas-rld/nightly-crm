import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Fastify, { type FastifyReply } from "fastify";
import { config } from "./config.js";
import { agentWebhookRoutes } from "./routes/agentWebhook.js";

const app = Fastify({
  logger: true,
  trustProxy: true,
});

function indexHtmlCandidates(): string[] {
  const here = dirname(fileURLToPath(import.meta.url));
  return [
    join(process.cwd(), "public", "index.html"),
    join(process.cwd(), "index.html"),
    join(here, "..", "public", "index.html"),
    join(here, "..", "index.html"),
  ];
}

async function sendIndexHtml(reply: FastifyReply) {
  const seen = new Set<string>();
  for (const file of indexHtmlCandidates()) {
    if (seen.has(file)) continue;
    seen.add(file);
    try {
      const html = await readFile(file, "utf8");
      return reply.type("text/html; charset=utf-8").send(html);
    } catch {
      /* essai suivant */
    }
  }
  return reply.code(404).send({ error: "index.html introuvable" });
}

app.get("/", async (_request, reply) => sendIndexHtml(reply));
app.get("/favicon.ico", async (_request, reply) => reply.code(204).send());
app.get("/health", async () => ({ status: "ok" }));

await app.register(agentWebhookRoutes);

export default app;

app.listen({ port: config.PORT, host: config.HOST });

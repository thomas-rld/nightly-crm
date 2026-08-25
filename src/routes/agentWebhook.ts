import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { agentEventSchema } from "../schemas/agentEvent.schema.js";
import { verifyApiKey } from "../plugins/apiKeyAuth.js";

export async function agentWebhookRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    "/webhook/agent",
    { preHandler: verifyApiKey },
    async (request, reply) => {
      const parseResult = agentEventSchema.safeParse(request.body);

      if (!parseResult.success) {
        return reply.code(400).send({
          error: "ValidationError",
          message: "Le corps de la requête ne respecte pas le schéma attendu",
          issues: (parseResult.error as ZodError).issues,
        });
      }

      const event = parseResult.data;
      const receivedAt = event.timestamp ?? new Date().toISOString();

      fastify.log.info(
        { agentId: event.agentId, type: event.type, receivedAt },
        "Événement d'agent reçu"
      );

      // TODO: brancher ici le traitement métier (persistance, file de tâches, etc.)

      return reply.code(202).send({
        status: "accepted",
        agentId: event.agentId,
        type: event.type,
        receivedAt,
      });
    }
  );
}

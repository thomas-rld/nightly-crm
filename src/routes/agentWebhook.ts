import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { agentEventSchema } from "../schemas/agentEvent.schema.js";
import { verifyApiKey } from "../plugins/apiKeyAuth.js";
import { prisma } from "../db.js";

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

      // 1. Enregistrement de l'événement brut, avant tout traitement métier,
      //    afin de garder une trace même si l'upsert du prospect échoue.
      const agentEvent = await prisma.agentEvent.create({
        data: {
          agentName: event.agentId,
          eventType: event.type,
          payload: event.payload as Prisma.InputJsonValue,
          status: "RECEIVED",
        },
      });

      try {
        // 2. Création ou mise à jour du prospect associé, si l'événement en
        //    porte les informations (identifié par son email).
        const lead = event.lead
          ? await prisma.lead.upsert({
              where: { email: event.lead.email },
              update: {
                nom: event.lead.nom,
                entreprise: event.lead.entreprise,
                statut: event.lead.statut,
                source: event.lead.source,
                metadata: event.lead.metadata as
                  | Prisma.InputJsonValue
                  | undefined,
              },
              create: {
                email: event.lead.email,
                nom: event.lead.nom,
                entreprise: event.lead.entreprise,
                statut: event.lead.statut,
                source: event.lead.source,
                metadata: event.lead.metadata as
                  | Prisma.InputJsonValue
                  | undefined,
              },
            })
          : null;

        await prisma.agentEvent.update({
          where: { id: agentEvent.id },
          data: { status: "PROCESSED" },
        });

        fastify.log.info(
          { agentId: event.agentId, type: event.type, receivedAt, leadId: lead?.id },
          "Événement d'agent traité"
        );

        return reply.code(202).send({
          status: "accepted",
          agentEventId: agentEvent.id,
          agentId: event.agentId,
          type: event.type,
          receivedAt,
          lead: lead
            ? { id: lead.id, email: lead.email, statut: lead.statut }
            : null,
        });
      } catch (error) {
        await prisma.agentEvent.update({
          where: { id: agentEvent.id },
          data: { status: "FAILED" },
        });

        fastify.log.error(
          { error, agentEventId: agentEvent.id },
          "Échec du traitement de l'événement d'agent"
        );

        return reply.code(500).send({
          error: "InternalError",
          message: "Échec de l'enregistrement/traitement de l'événement",
          agentEventId: agentEvent.id,
        });
      }
    }
  );
}

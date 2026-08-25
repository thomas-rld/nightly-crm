import { z } from "zod";

/**
 * Schéma de validation pour les événements entrants sur POST /webhook/agent.
 *
 * `type`      : la nature de l'événement émis par l'agent (ex: "message", "status", "error").
 * `agentId`   : identifiant unique de l'agent émetteur.
 * `timestamp` : date ISO 8601 de l'événement (générée par défaut si absente).
 * `payload`   : contenu libre de l'événement, propre à chaque `type`.
 */
export const agentEventSchema = z.object({
  type: z.enum(["message", "status", "error", "task.completed", "task.failed"]),
  agentId: z.string().min(1, "agentId est requis"),
  timestamp: z.string().datetime().optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type AgentEvent = z.infer<typeof agentEventSchema>;

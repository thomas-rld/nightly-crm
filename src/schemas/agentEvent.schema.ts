import { z } from "zod";

/**
 * Statuts de prospect (Lead) reconnus, alignés avec l'enum `LeadStatus` du
 * schéma Prisma (`prisma/schema.prisma`).
 */
export const leadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "WON",
  "LOST",
]);

/**
 * Données de prospect optionnellement portées par un événement d'agent.
 * Lorsqu'elles sont présentes, elles déclenchent un upsert du `Lead`
 * correspondant (identifié par `email`).
 */
export const leadDataSchema = z.object({
  email: z.string().email("email de prospect invalide"),
  nom: z.string().optional(),
  entreprise: z.string().optional(),
  statut: leadStatusSchema.optional(),
  source: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schéma de validation pour les événements entrants sur POST /webhook/agent.
 *
 * `type`      : la nature de l'événement émis par l'agent (ex: "message", "status", "error").
 * `agentId`   : identifiant (ou nom) de l'agent émetteur.
 * `timestamp` : date ISO 8601 de l'événement (générée par défaut si absente).
 * `payload`   : contenu libre de l'événement, propre à chaque `type`.
 * `lead`      : (optionnel) informations de prospect à créer/mettre à jour.
 */
export const agentEventSchema = z.object({
  type: z.enum(["message", "status", "error", "task.completed", "task.failed"]),
  agentId: z.string().min(1, "agentId est requis"),
  timestamp: z.string().datetime().optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
  metadata: z.record(z.string(), z.unknown()).optional(),
  lead: leadDataSchema.optional(),
});

export type AgentEvent = z.infer<typeof agentEventSchema>;
export type LeadData = z.infer<typeof leadDataSchema>;

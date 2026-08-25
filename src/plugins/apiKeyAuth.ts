import type { FastifyReply, FastifyRequest } from "fastify";
import { config } from "../config.js";

/**
 * Vérifie la présence et la validité de la clé d'API attendue dans le header
 * `x-api-key`. À utiliser comme `preHandler` sur les routes à protéger.
 */
export async function verifyApiKey(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const providedKey = request.headers["x-api-key"];

  if (!providedKey || providedKey !== config.API_KEY) {
    reply.code(401).send({
      error: "Unauthorized",
      message: "Clé d'API manquante ou invalide (header x-api-key)",
    });
  }
}

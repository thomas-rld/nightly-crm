import { PrismaClient } from "@prisma/client";

/**
 * Instance unique du client Prisma, partagée par toute l'application.
 * Évite la création de multiples connexions lors du rechargement à chaud
 * en développement (`tsx watch`).
 */
export const prisma = new PrismaClient();

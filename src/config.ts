import "dotenv/config";
import { z } from "zod";

/** Vercel peut injecter PORT="" : coerce d'une chaîne vide donne 0 et fait planter Zod. */
const emptyToUndef = (value: unknown) =>
  value === undefined || value === null || String(value).trim() === "" ? undefined : value;

const envSchema = z.object({
  PORT: z.preprocess(emptyToUndef, z.coerce.number().int().positive().default(3000)),
  API_KEY: z.preprocess((value) => {
    const next = emptyToUndef(value);
    return typeof next === "string" ? next : "";
  }, z.string()),
  HOST: z.preprocess(emptyToUndef, z.string().default("0.0.0.0")),
});

function loadConfig() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Configuration invalide, vérifie tes variables d'environnement :\n${issues}`
    );
  }

  return parsed.data;
}

export const config = loadConfig();

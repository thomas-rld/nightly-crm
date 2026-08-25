import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  API_KEY: z.string().min(1, "API_KEY est requis pour sécuriser le webhook"),
  HOST: z.string().default("0.0.0.0"),
});

function loadConfig() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Configuration invalide, vérifie ton fichier .env :\n${issues}`
    );
  }

  return parsed.data;
}

export const config = loadConfig();

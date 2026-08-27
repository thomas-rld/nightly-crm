import { config } from "../src/config.js";
import { agentEventSchema } from "../src/schemas/agentEvent.schema.js";

export async function POST(request: Request) {
  const providedKey = request.headers.get("x-api-key");

  if (!config.API_KEY || !providedKey || providedKey !== config.API_KEY) {
    return Response.json(
      {
        error: "Unauthorized",
        message: "Clé d'API manquante ou invalide (header x-api-key)",
      },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "ValidationError", message: "Le corps de la requête n'est pas un JSON valide" },
      { status: 400 }
    );
  }

  const parseResult = agentEventSchema.safeParse(body);
  if (!parseResult.success) {
    return Response.json(
      {
        error: "ValidationError",
        message: "Le corps de la requête ne respecte pas le schéma attendu",
        issues: parseResult.error.issues,
      },
      { status: 400 }
    );
  }

  const event = parseResult.data;
  const receivedAt = event.timestamp ?? new Date().toISOString();

  return Response.json(
    {
      status: "accepted",
      agentId: event.agentId,
      type: event.type,
      receivedAt,
    },
    { status: 202 }
  );
}

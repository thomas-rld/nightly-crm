# nightly-crm

## Connecteur d'agents

Ce dépôt contient un connecteur d'agents en TypeScript / Node.js, basé sur [Fastify](https://fastify.dev/) et validé avec [Zod](https://zod.dev/). Il expose une API webhook permettant de recevoir des événements émis par des agents externes.

### Installation

```bash
npm install
cp .env.example .env
# Édite .env pour définir API_KEY (et éventuellement PORT / HOST)
```

### Développement

```bash
npm run dev
```

Lance le serveur avec rechargement automatique (`tsx watch`).

### Build & production

```bash
npm run build
npm start
```

### Endpoints

- `GET /health` — vérification de l'état du service.
- `POST /webhook/agent` — réception d'événements d'agents.
  - Header requis : `x-api-key` (doit correspondre à la variable `API_KEY`).
  - Corps de la requête (JSON), validé avec Zod (`src/schemas/agentEvent.schema.ts`) :

    ```json
    {
      "type": "message",
      "agentId": "agent-123",
      "timestamp": "2026-08-25T21:00:00.000Z",
      "payload": { "text": "Bonjour" },
      "metadata": { "source": "slack" }
    }
    ```

  - `type` doit être l'une des valeurs suivantes : `message`, `status`, `error`, `task.completed`, `task.failed`.
  - `timestamp` et `metadata` sont optionnels ; `payload` est optionnel (objet vide par défaut).

  Réponses :
  - `202 Accepted` : événement reçu et validé.
  - `400 Bad Request` : le corps ne respecte pas le schéma attendu.
  - `401 Unauthorized` : clé d'API manquante ou invalide.

### Structure du projet

```
src/
  config.ts                    # Chargement et validation des variables d'environnement
  index.ts                     # Point d'entrée : instanciation et démarrage du serveur Fastify
  plugins/
    apiKeyAuth.ts               # Middleware de vérification de la clé d'API
  routes/
    agentWebhook.ts             # Route POST /webhook/agent
  schemas/
    agentEvent.schema.ts        # Schéma Zod des événements d'agents
```

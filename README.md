# nightly-crm

## Connecteur d'agents

Ce dépôt contient un connecteur d'agents en TypeScript / Node.js, basé sur [Fastify](https://fastify.dev/), validé avec [Zod](https://zod.dev/) et persisté avec [Prisma](https://www.prisma.io/) (base [SQLite](https://www.sqlite.org/)). Il expose une API webhook permettant de recevoir des événements émis par des agents externes, de les enregistrer, et de créer/mettre à jour les prospects (leads) associés.

### Installation

```bash
npm install
cp .env.example .env
# Édite .env pour définir API_KEY (et éventuellement PORT / HOST / DATABASE_URL)
npm run db:migrate
```

`db:migrate` applique les migrations Prisma et crée la base SQLite locale (`prisma/dev.db`, fichier ignoré par git) ainsi que le client Prisma généré.

### Développement

```bash
npm run dev
```

Lance le serveur avec rechargement automatique (`tsx watch`).

### Base de données (Prisma + SQLite)

```bash
npm run db:migrate    # Applique les migrations en dev (crée une nouvelle migration si le schéma a changé)
npm run db:generate   # (Re)génère le client Prisma sans migrer
npm run db:studio     # Ouvre Prisma Studio pour explorer/éditer les données
```

Le schéma (`prisma/schema.prisma`) définit deux modèles :

- **`Lead`** — un prospect : `id`, `email` (unique), `nom`, `entreprise`, `statut` (`NEW` | `CONTACTED` | `QUALIFIED` | `WON` | `LOST`), `source`, `metadata` (JSON libre), `createdAt`, `updatedAt`.
- **`AgentEvent`** — la trace de chaque événement reçu : `id`, `agentName`, `eventType`, `payload` (JSON), `status` (`RECEIVED` | `PROCESSED` | `FAILED`), `createdAt`.

### Build & production

```bash
npm run build
npm start
```

### Endpoints

- `GET /health` — vérification de l'état du service.
- `POST /webhook/agent` — réception d'événements d'agents. À chaque appel :
  1. l'événement est enregistré dans `AgentEvent` (statut `RECEIVED`, puis `PROCESSED` ou `FAILED`) ;
  2. si le champ `lead` est fourni, le prospect correspondant (identifié par son `email`) est créé ou mis à jour (`upsert`) dans `Lead`.

  - Header requis : `x-api-key` (doit correspondre à la variable `API_KEY`).
  - Corps de la requête (JSON), validé avec Zod (`src/schemas/agentEvent.schema.ts`) :

    ```json
    {
      "type": "task.completed",
      "agentId": "agent-crm-bot",
      "timestamp": "2026-08-25T21:00:00.000Z",
      "payload": { "note": "Nouveau lead qualifié" },
      "metadata": { "source": "slack" },
      "lead": {
        "email": "jean.dupont@example.com",
        "nom": "Jean Dupont",
        "entreprise": "Acme SAS",
        "statut": "QUALIFIED",
        "source": "linkedin",
        "metadata": { "score": 87 }
      }
    }
    ```

  - `type` doit être l'une des valeurs suivantes : `message`, `status`, `error`, `task.completed`, `task.failed`.
  - `timestamp`, `metadata` et `lead` sont optionnels ; `payload` est optionnel (objet vide par défaut).
  - `lead.email` est requis si `lead` est fourni ; les autres champs de `lead` sont optionnels et ne modifient, en mise à jour, que les valeurs fournies (les champs absents conservent leur valeur existante).

  Réponses :
  - `202 Accepted` : événement enregistré (et prospect créé/mis à jour si `lead` fourni).
  - `400 Bad Request` : le corps ne respecte pas le schéma attendu.
  - `401 Unauthorized` : clé d'API manquante ou invalide.
  - `500 Internal Server Error` : échec de l'upsert du prospect (l'événement reste enregistré avec le statut `FAILED`).

### Structure du projet

```
prisma/
  schema.prisma                 # Modèles Lead et AgentEvent, datasource SQLite
  migrations/                   # Historique des migrations Prisma
src/
  config.ts                    # Chargement et validation des variables d'environnement
  db.ts                         # Instance partagée du client Prisma
  index.ts                     # Point d'entrée : instanciation et démarrage du serveur Fastify
  plugins/
    apiKeyAuth.ts               # Middleware de vérification de la clé d'API
  routes/
    agentWebhook.ts             # Route POST /webhook/agent (persistance + upsert lead)
  schemas/
    agentEvent.schema.ts        # Schémas Zod des événements d'agents et des données de lead
```

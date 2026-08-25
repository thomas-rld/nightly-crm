# nightly-crm

Tableau de bord CRM léger servi par [Fastify](https://fastify.dev/), pour suivre des prospects («leads») et le flux d'événements générés par des agents automatisés.

## Démarrage

```bash
npm install
npm start
```

Le serveur démarre sur `http://localhost:3000` (variables d'env `PORT` / `HOST` disponibles).

- `GET /` — sert le tableau de bord (HTML/Tailwind CDN/JS vanilla) depuis `public/`.
- `GET /api/leads?status=&q=` — liste des prospects triés par date décroissante, filtrables par statut (`new`, `contacted`, `qualified`, `converted`, `lost`) et par recherche libre (nom, email, entreprise).
- `GET /api/leads/:id` — détail d'un prospect.
- `GET /api/stats` — indicateurs clés : total de prospects, leads du jour, répartition par statut.
- `GET /api/events` — les 20 derniers événements agents.

## Architecture

```
src/
  server.js        # Fastify + @fastify/static
  data/store.js     # jeu de données en mémoire (prospects + événements agents)
  routes/
    leads.js
    stats.js
    events.js
public/
  index.html        # dashboard (thème sombre, Tailwind via CDN)
  app.js            # logique front (fetch, recherche live, tiroir JSON, flux temps réel)
  styles.css        # ajustements visuels complémentaires
```

Les données sont générées en mémoire au démarrage du serveur (pas de base de données requise), ce qui permet de tester l'interface immédiatement.

# nightly-crm

Tableau de bord léger servi par [Fastify](https://fastify.dev/), pensé comme l'infrastructure opérationnelle B2B de l'écosystème nocturne : mise en relation entre **talents** (DJs, photographes, vidéastes) et **acheteurs** (clubs, bars d'ambiance, organisateurs d'événements), avec suivi des **demandes de booking**.

## Démarrage

```bash
npm install
npm start
```

Le serveur démarre sur `http://localhost:3000` (variables d'env `PORT` / `HOST` disponibles).

- `GET /` — sert le tableau de bord (HTML/Tailwind CDN/JS vanilla) depuis `public/`.
- `GET /api/talents?type=&q=&availableTonight=` — liste des talents (DJs, photographes, vidéastes), triés par note décroissante, filtrables par métier, recherche libre (nom, style, ville) et disponibilité ce soir (utilisé par le bouton « SOS Remplacement »).
- `GET /api/talents/:id` — détail d'un talent.
- `GET /api/bookings?status=&q=` — demandes de booking (En attente, Confirmé, Urgence/Désistement, Terminé), triées par urgence puis par date d'événement.
- `GET /api/bookings/:id` — détail d'une demande de booking.
- `GET /api/stats` — indicateurs clés : talents actifs, bookings ce week-end, alertes urgence ce soir, volume d'affaires généré, répartitions par métier et par statut.

## Architecture

```
src/
  server.js         # Fastify + @fastify/static
  data/store.js      # jeu de données en mémoire (talents, acheteurs, bookings)
  routes/
    talents.js
    bookings.js
    stats.js
public/
  index.html         # dashboard (thème sombre, Tailwind via CDN)
  app.js             # logique front (fetch, recherche live, filtres métier, SOS, tiroir profil, proposer une date)
  styles.css         # ajustements visuels complémentaires
```

Les données sont générées en mémoire au démarrage du serveur (pas de base de données requise), ce qui permet de tester l'interface immédiatement.

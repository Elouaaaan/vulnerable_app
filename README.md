## vulnerable_app — Documentation technique

### Fonctionnalités
- **Authentification**: inscription patient, connexion par email/mot de passe, session via cookie `jwt`.
- **Page d’accueil**: liens vers la réservation et la liste des rendez‑vous.
- **Réservation**: sélection d’un médecin, création du rendez‑vous.
- **Confirmation**: affichage des détails du rendez‑vous créé.
- **Mes rendez‑vous**: liste des rendez‑vous du patient connecté.
  - Page « My appointments » ajoutée: consultation des rendez‑vous existants.

### Prérequis
- Docker et Docker Compose
- Ports libres: Postgres `5432`, application `3000`

### Installation et configuration
1) Créer un fichier `.env` à la racine avec au minimum:
```
DB_USER=app
DB_PASSWORD=app
DB_NAME=app
DB_HOST=postgresdb
DB_PORT=5432
DB_LOCAL_PORT=5432
DB_DOCKER_PORT=5432
NODE_LOCAL_PORT=3000
NODE_DOCKER_PORT=3000
JWT_SECRET=devsecret
JWT_EXPIRES_IN=2h
COOKIE_SECRET=devcookie
COOKIE_EXPIRES_IN=7200000
```
2) Lancer l’environnement Docker:
```bash
docker compose up --build
```
3) Accéder à l’application: `http://localhost:3000`

### Endpoints principaux
- `GET /` : page d’accueil.
- `GET /auth/` : page d’auth; `POST /auth/login`, `POST /auth/register`, `GET /auth/logout`.
- `GET /appointments` : liste des rendez‑vous. 
- `GET /appointments/new` : page de réservation.
- `GET /appointments/slots?doctor_id=...` : JSON des créneaux. 
- `POST /appointments/` : création de rendez‑vous.
- `GET /appointments/confirm/:id` : confirmation/détails. 

### Pages / UI ajoutées
- Accueil (navbar + footer) avec liens vers « Book » et « My appointments » si connecté.
- Réservation (`/appointments/new`): sélection du médecin, chargement des créneaux via fetch `/appointments/slots`.
- Liste (`/appointments`): affiche les rendez‑vous du patient.
- Confirmation (`/appointments/confirm/:id`).

### Infrastructure 
- Orchestration: Docker Compose (`docker-compose.yml`)
  - Service `postgresdb` (PostgreSQL 15)
    - Variables depuis `.env` (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, ports)
    - Volume persistant `db`
    - Initialisation via scripts `db/init/*.sql` (schéma + données)
  - Service `app` (Node.js/Express)
    - Build depuis `app/Dockerfile`
    - Expose le port `NODE_LOCAL_PORT` vers `NODE_DOCKER_PORT`
    - `DB_URL` injectée depuis `.env` pour la connexion Postgres
- Réseau par défaut de Compose, communication `app` → `postgresdb` via `DB_HOST=postgresdb`

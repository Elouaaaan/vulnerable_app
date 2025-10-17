## vulnerable_app — Documentation technique

### Fonctionnalités
- **Authentification**: inscription patient, connexion par email/mot de passe, session via cookie `jwt`.
- **Page d’accueil**: liens vers la réservation et la liste des rendez‑vous.
- **Réservation**: sélection d’un médecin, création du rendez‑vous.
- **Confirmation**: affichage des détails du rendez‑vous créé.
- **Mes rendez‑vous**: liste des rendez‑vous du patient connecté.

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
- `GET /`: page d’accueil.
- `GET /auth/`: page d’auth; `POST /auth/login`, `POST /auth/register`.
- `GET /appointments`: liste des rendez‑vous du patient connecté.
- `GET /appointments/new`: page de réservation.
- `GET /appointments/slots?doctor_id=...`: JSON des créneaux disponibles pour un médecin.
- `POST /appointments/`: création de rendez‑vous (transaction: lock du créneau, update, insertion).
- `GET /appointments/confirm/:id`: confirmation et détails d’un rendez‑vous.

# 🏥 MediConnect - Healthcare Appointment Platform## vulnerable_app — Documentation technique



## 📋 Description### Fonctionnalités

- **Authentification**: inscription patient, connexion par email/mot de passe, session via cookie `jwt`.

MediConnect is a web-based healthcare appointment platform that allows patients to book appointments with doctors, manage their medical profiles, and access healthcare services online.- **Page d’accueil**: liens vers la réservation et la liste des rendez‑vous.

- **Réservation**: sélection d’un médecin, création du rendez‑vous.

## ⚠️ Educational Purpose- **Confirmation**: affichage des détails du rendez‑vous créé.

- **Mes rendez‑vous**: liste des rendez‑vous du patient connecté.

**This application is intentionally vulnerable and designed for cybersecurity education and penetration testing practice.**

### Prérequis

**DO NOT deploy this application in a production environment!**- Docker et Docker Compose

- Ports libres: Postgres `5432`, application `3000`

## ✨ Fonctionnalités

### Installation et configuration

- **Authentification**: Inscription patient, connexion par email/mot de passe, session via cookie JWT1) Créer un fichier `.env` à la racine avec au minimum:

- **Page d'accueil**: Liens vers la réservation et la liste des rendez-vous```

- **Réservation**: Sélection d'un médecin, création du rendez-vousDB_USER=app

- **Confirmation**: Affichage des détails du rendez-vous crééDB_PASSWORD=app

- **Mes rendez-vous**: Liste des rendez-vous du patient connectéDB_NAME=app

- **Profil utilisateur**: Upload de photo de profil (vulnérable)DB_HOST=postgresdb

DB_PORT=5432

## 🎯 Vulnérabilités PrésentesDB_LOCAL_PORT=5432

DB_DOCKER_PORT=5432

### 1. **Remote Code Execution (RCE)** via Double ExtensionNODE_LOCAL_PORT=3000

- File upload bypass avec `.js.png`, `.php.jpg`NODE_DOCKER_PORT=3000

- Validation faible basée sur `path.extname()`JWT_SECRET=devsecret

- Exécution de code JavaScript côté serveurJWT_EXPIRES_IN=2h

- Flag accessible via `/flag.txt`COOKIE_SECRET=devcookie

- 📖 **Documentation**: `VULNERABILITY_RCE.md`COOKIE_EXPIRES_IN=7200000

```

### 2. **Broken Access Control (BAC)** via Cookie Manipulation2) Lancer l’environnement Docker:

- Vérification de rôle admin basée sur cookie client```bash

- Cookie `isAdmin=true` modifiable dans le navigateurdocker compose up --build

- Accès non autorisé au panneau admin```

- Flag affiché sur la page d'accueil3) Accéder à l’application: `http://localhost:3000`

- 📖 **Documentation**: `VULNERABILITY_BAC.md`

### Endpoints principaux

## 🚀 Installation Rapide- `GET /`: page d’accueil.

- `GET /auth/`: page d’auth; `POST /auth/login`, `POST /auth/register`.

### Prérequis- `GET /appointments`: liste des rendez‑vous du patient connecté.

- Docker Desktop installé et démarré- `GET /appointments/new`: page de réservation.

- Ports libres: `8080` (app), `5432` (PostgreSQL)- `GET /appointments/slots?doctor_id=...`: JSON des créneaux disponibles pour un médecin.

- `POST /appointments/`: création de rendez‑vous (transaction: lock du créneau, update, insertion).

### Démarrage- `GET /appointments/confirm/:id`: confirmation et détails d’un rendez‑vous.


```bash
# Cloner le repository
git clone https://github.com/Elouaaaan/vulnerable_app.git
cd vulnerable_app

# Démarrer l'application
docker-compose up -d --build

# Accéder à l'application
# → http://localhost:8080
```

### Configuration par défaut

- **Port Application**: 8080
- **Port PostgreSQL**: 5432
- **Framework**: Express.js + Node.js 24
- **Base de données**: PostgreSQL 15
- **Template Engine**: EJS
- **Authentification**: JWT + bcrypt
- **CSS Framework**: Tailwind CSS 3.4.18

## 🎯 Exploitation Rapide

### **Vulnérabilité #1: RCE (3 minutes)**
1. Créer un compte sur http://localhost:8080
2. Aller dans "Mon Profil"
3. Upload `test.js.png` (2 lignes, 138 bytes)
4. Accéder à `/uploads/profile-X-XXXXX-test.js.png`
5. 🎉 **FLAG affiché dans le navigateur !**

### **Vulnérabilité #2: BAC (30 secondes)**
1. Ouvrir http://localhost:8080
2. Console DevTools (F12) → Console
3. Taper: `document.cookie = "isAdmin=true"; location.reload();`
4. 🎉 **Panneau admin + FLAG visible !**

## 📚 Technologies Utilisées

- **Backend**: Node.js 24, Express.js 4.21.2
- **Database**: PostgreSQL 15
- **Template Engine**: EJS 3.1.10
- **CSS Framework**: Tailwind CSS 3.4.18
- **Authentication**: JWT (jsonwebtoken 9.0.2), bcrypt 5.1.1
- **File Upload**: Multer 1.4.5-lts.1
- **Containerization**: Docker, Docker Compose

## 🗂️ Structure du Projet

```
vulnerable_app/
├── app/
│   ├── routes/              # Routes Express
│   │   ├── index.js         # Page d'accueil (BAC vuln)
│   │   ├── users.js         # Upload + profil (RCE vuln)
│   │   ├── auth.js          # Login/Register
│   │   └── appointments.js  # Gestion RDV
│   ├── views/               # Templates EJS
│   │   ├── index.ejs        # Home page
│   │   ├── profile.ejs      # User profile
│   │   ├── auth.ejs         # Login/Register
│   │   └── appointments_*.ejs
│   ├── public/              # Fichiers statiques
│   │   ├── uploads/         # ⚠️ Fichiers uploadés (RCE)
│   │   ├── stylesheets/     # CSS (Tailwind)
│   │   └── javascripts/     # JS frontend
│   ├── middlewares/         # Middlewares custom
│   │   └── authMiddleware.js
│   └── app.js               # ⚠️ Middleware malveillant
├── db/
│   └── init/                # Scripts SQL
│       ├── 01-create-database.sql
│       └── 02-seed-temp-data.sql
├── docker-compose.yml       # Orchestration Docker
├── README.md                # Ce fichier
├── VULNERABILITY_RCE.md     # Guide RCE complet
├── VULNERABILITY_BAC.md     # Guide BAC complet
└── test.js.png              # Payload RCE minimal
```

## 🛠️ Commandes Utiles

### Gestion des conteneurs
```bash
# Voir les logs de l'application
docker logs vulnerable_app-app-1 -f

# Voir les logs PostgreSQL
docker logs vulnerable_app-postgresdb-1 -f

# Vérifier que le flag existe
docker exec vulnerable_app-app-1 cat /flag.txt

# Redémarrer l'application
docker-compose restart app

# Rebuild complet
docker-compose down
docker-compose up -d --build
```

### Base de données
```bash
# Accéder au shell PostgreSQL
docker-compose exec postgresdb psql -U user -d mediconnect

# Lister les tables
docker-compose exec postgresdb psql -U user -d mediconnect -c "\dt"

# Voir les utilisateurs
docker-compose exec postgresdb psql -U user -d mediconnect -c "SELECT id, email, name, role FROM users;"
```

### Endpoints principaux

**Authentification:**
- `GET /auth` - Page login/register
- `POST /auth/login` - Connexion
- `POST /auth/register` - Inscription
- `GET /auth/logout` - Déconnexion

**Pages:**
- `GET /` - Page d'accueil (⚠️ BAC vulnerability)
- `GET /users/profile` - Profil utilisateur
- `POST /users/profile/upload` - Upload photo (⚠️ RCE vulnerability)

**Rendez-vous:**
- `GET /appointments` - Liste des RDV
- `GET /appointments/new` - Nouvelle réservation
- `GET /appointments/slots?doctor_id=X` - Créneaux disponibles
- `POST /appointments/` - Créer un RDV
- `GET /appointments/confirm/:id` - Confirmation

## 🎓 Ressources Pédagogiques

### Guides d'Exploitation
- 📖 **`VULNERABILITY_RCE.md`** - Exploitation RCE complète (double extension)
- 📖 **`VULNERABILITY_BAC.md`** - Exploitation BAC complète (cookie manipulation)

### Payloads
- `test.js.png` - Payload RCE minimal (138 bytes, 2 lignes)

## ⚖️ Avertissement Légal

Cette application est fournie **à des fins éducatives uniquement**.

- ⚠️ Ne testez que sur votre installation locale
- ⚠️ Ne pas utiliser ces techniques sans autorisation
- ⚠️ L'accès non autorisé à des systèmes est illégal
- ⚠️ Utilisez ces connaissances de manière responsable et éthique

## 🤝 Contribution

Projet éducatif. Si vous trouvez des vulnérabilités supplémentaires :
1. Documenter la vulnérabilité
2. Proposer un correctif
3. Soumettre une pull request

## 📄 Licence

Ce projet est à des fins éducatives. Utilisez-le à vos propres risques.

---

**Happy Hacking! 🔓**

*Remember: With great power comes great responsibility.*

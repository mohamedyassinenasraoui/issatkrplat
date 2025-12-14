# ISSAT Kairouan - Plateforme Universitaire

Plateforme complète de gestion universitaire pour l'ISSAT Kairouan, incluant la gestion des absences, documents administratifs, résultats, et un assistant IA.

## 🚀 Technologies

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS (Dark Mode)
- React Router
- Axios
- Recharts
- Framer Motion
- React Hot Toast

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (upload de fichiers)
- OpenAI API

## 📁 Structure du Projet

```
issatkr/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── services/      # Services API
│   │   ├── context/       # Context React (Auth)
│   │   └── types/         # Types TypeScript
│   └── package.json
├── server/                 # Backend Express
│   ├── controllers/        # Contrôleurs
│   ├── models/             # Modèles Mongoose
│   ├── routes/             # Routes API
│   ├── middlewares/        # Middlewares (auth, role)
│   ├── utils/              # Utilitaires (upload, seed)
│   └── server.js           # Point d'entrée
└── README.md
```

## 🛠️ Installation

### Prérequis
- Node.js 18+
- MongoDB (local ou Atlas)
- OpenAI API Key (optionnel, pour l'assistant IA)

### Étapes

1. **Cloner le projet**
```bash
cd issatkr
```

2. **Installer les dépendances**

Backend:
```bash
cd server
npm install
```

Frontend:
```bash
cd client
npm install
```

3. **Configuration**

Créer un fichier `.env` dans `server/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/issat
JWT_SECRET=your-secret-key-change-this
OPENAI_API_KEY=your-openai-api-key
```

4. **Initialiser la base de données**
```bash
cd server
npm run seed
```

5. **Démarrer les serveurs**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

## 👤 Comptes de démonstration

Après avoir exécuté le seed:
- **Admin**: `admin@issat.tn` / `password123`
- **Étudiant 1**: `student1@issat.tn` / `password123`
- **Étudiant 2**: `student2@issat.tn` / `password123`

## ✨ Fonctionnalités

### Étudiant
- ✅ Tableau de bord avec statistiques
- ✅ Suivi des absences (avec alertes à 3 et 4 absences)
- ✅ Soumission de justifications
- ✅ Demandes de documents administratifs
- ✅ Assistant IA pour questions
- ✅ Notes d'information
- ✅ Messages de l'administration
- ✅ Suggestions (anonymes possibles)
- ✅ Consultation des résultats
- ✅ Informations sur le groupe
- ✅ Blog des absences (statistiques par matière)
- ✅ Profil en lecture seule

### Administrateur
- ✅ Tableau de bord avec statistiques complètes
- ✅ Gestion des étudiants (CRUD)
- ✅ Gestion des modules (CRUD)
- ✅ Enregistrement des absences
- ✅ Validation/refus des justifications
- ✅ Traitement des demandes de documents
- ✅ Gestion des notes d'information
- ✅ Envoi de messages aux étudiants
- ✅ Révision des suggestions
- ✅ Gestion des résultats

## 🎨 Design

- **Thème**: Dark Mode
- **Couleurs**: Palette sombre professionnelle
- **Responsive**: Mobile-first
- **Accessibilité**: Contraste élevé, navigation clavier

## 📝 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Étudiants
- `GET /api/admin/students` - Liste des étudiants
- `POST /api/admin/students` - Créer un étudiant
- `GET /api/admin/students/:id` - Détails d'un étudiant
- `PUT /api/admin/students/:id` - Modifier un étudiant
- `DELETE /api/admin/students/:id` - Supprimer un étudiant

### Absences
- `GET /api/absences/student` - Absences de l'étudiant
- `POST /api/absences/record` - Enregistrer une absence (admin)
- `POST /api/absences/justify` - Justifier une absence

### Documents
- `GET /api/documents/student` - Demandes de l'étudiant
- `POST /api/documents/request` - Créer une demande
- `GET /api/documents/all` - Toutes les demandes (admin)
- `PUT /api/documents/:id/process` - Traiter une demande (admin)

### Assistant IA
- `POST /api/ai/ask` - Poser une question

Voir les fichiers dans `server/routes/` pour la liste complète.

## 🔒 Sécurité

- Authentification JWT
- Hachage des mots de passe (bcrypt)
- Protection des routes par rôle
- Validation des données
- Upload sécurisé des fichiers

## 📦 Scripts

### Backend
- `npm run dev` - Démarrer en mode développement
- `npm start` - Démarrer en production
- `npm run seed` - Initialiser la base de données

### Frontend
- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualiser le build

## 🤝 Contribution

Ce projet a été développé pour un hackathon. Pour contribuer:
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est développé pour l'ISSAT Kairouan.

## 👨‍💻 Auteur

Développé pour le hackathon ISSAT Kairouan.

---

**Note**: Assurez-vous que MongoDB est en cours d'exécution avant de démarrer le serveur backend.

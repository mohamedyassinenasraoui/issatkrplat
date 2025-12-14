# 🚀 Guide de Déploiement Étape par Étape - ISSAT Kairouan Platform

Ce guide vous explique **exactement** comment déployer la plateforme ISSAT Kairouan sur Render gratuitement avec **deux services séparés** (Backend et Frontend).

---

## 📋 Prérequis

Avant de commencer, vous devez avoir :
- ✅ Un compte GitHub (votre code est déjà sur : `mohamedyassinenasraoui/issatkrplat`)
- ✅ Un compte email pour créer les comptes gratuits

---

## ÉTAPE 1 : Configurer MongoDB Atlas (Base de données)

### 1.1 Créer un compte MongoDB Atlas

1. Allez sur : https://www.mongodb.com/cloud/atlas/register
2. Créez un compte gratuit (ou connectez-vous si vous en avez déjà un)
3. Remplissez le formulaire d'inscription

### 1.2 Créer un Cluster

1. Une fois connecté, cliquez sur **"Build a Database"**
2. Choisissez le plan **FREE (M0)** - c'est gratuit
3. Sélectionnez un **Cloud Provider** (AWS recommandé)
4. Choisissez une **Region** proche de vous (ex: `eu-west-1` pour l'Europe)
5. Laissez le nom par défaut ou changez-le (ex: `Cluster0`)
6. Cliquez sur **"Create"**
7. ⏳ Attendez 3-5 minutes que le cluster soit créé

### 1.3 Créer un Utilisateur de Base de Données

1. Dans la section **"Security"** → **"Database Access"**
2. Cliquez sur **"Add New Database User"**
3. Choisissez **"Password"** comme méthode d'authentification
4. Créez un nom d'utilisateur (ex: `issatkr-admin`)
5. Créez un mot de passe **fort** (notez-le quelque part !)
6. Pour **"Database User Privileges"**, choisissez **"Atlas admin"**
7. Cliquez sur **"Add User"**

### 1.4 Configurer l'Accès Réseau

1. Dans la section **"Security"** → **"Network Access"**
2. Cliquez sur **"Add IP Address"**
3. Cliquez sur **"Allow Access from Anywhere"** (ajoute `0.0.0.0/0`)
   - ⚠️ C'est nécessaire pour que Render puisse se connecter
4. Cliquez sur **"Confirm"**

### 1.5 Récupérer l'URI de Connexion

1. Retournez à **"Database"** → **"Connect"**
2. Cliquez sur **"Connect your application"**
3. Choisissez **"Node.js"** comme driver
4. Copiez l'URI qui ressemble à :
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Remplacez** `<username>` et `<password>` par vos identifiants créés à l'étape 1.3
6. Ajoutez le nom de la base de données à la fin :
   ```
   mongodb+srv://issatkr-admin:VotreMotDePasse@cluster0.xxxxx.mongodb.net/issatkr?retryWrites=true&w=majority
   ```
7. **Copiez cette URI complète** - vous en aurez besoin plus tard !

---

## ÉTAPE 2 : Créer un Compte Render

1. Allez sur : https://dashboard.render.com
2. Cliquez sur **"Get Started for Free"**
3. Choisissez **"Sign up with GitHub"** (recommandé)
4. Autorisez Render à accéder à votre compte GitHub
5. Votre compte est créé ! 🎉

---

## ÉTAPE 3 : Déployer le Backend (API Server)

### 3.1 Créer un Nouveau Web Service pour le Backend

1. Dans le dashboard Render, cliquez sur **"New +"** (en haut à droite)
2. Sélectionnez **"Web Service"**

### 3.2 Connecter le Dépôt GitHub

1. Si c'est votre première fois, cliquez sur **"Connect GitHub"**
2. Autorisez Render à accéder à vos dépôts
3. Dans la liste des dépôts, cherchez et sélectionnez : **`issatkrplat`**
4. Cliquez sur **"Connect"**

### 3.3 Configurer le Service Backend

Remplissez les champs suivants :

**Basic Settings:**
- **Name**: `issatkr-backend` (ou `issatkr-api`)
- **Region**: Choisissez la région la plus proche (ex: `Frankfurt` pour l'Europe)
- **Branch**: `main` (ou `master` selon votre dépôt)
- **Root Directory**: `server` ⚠️ **IMPORTANT : Spécifiez le dossier server**

**Build & Deploy:**
- **Environment**: `Node`
- **Build Command**: 
  ```bash
  npm install
  ```
- **Start Command**: 
  ```bash
  npm start
  ```

### 3.4 Ajouter les Variables d'Environnement pour le Backend

Cliquez sur **"Advanced"** → **"Add Environment Variable"** et ajoutez :

#### Variable 1 : NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`
- Cliquez sur **"Save"**

#### Variable 2 : PORT
- **Key**: `PORT`
- **Value**: (Laissez vide - Render définit automatiquement le PORT)
- ⚠️ **Ne pas définir** - Render le gère automatiquement

#### Variable 3 : MONGODB_URI
- **Key**: `MONGODB_URI`
- **Value**: Collez l'URI MongoDB que vous avez copiée à l'étape 1.5
  ```
  mongodb+srv://issatkr-admin:VotreMotDePasse@cluster0.xxxxx.mongodb.net/issatkr?retryWrites=true&w=majority
  ```
- Cliquez sur **"Save"**

#### Variable 4 : JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: Générez une clé secrète sécurisée
  - Sur Windows (PowerShell) :
    ```powershell
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    ```
  - Ou utilisez un générateur en ligne : https://randomkeygen.com/
  - Copiez une chaîne de 128 caractères
- Cliquez sur **"Save"**

#### Variable 5 : OPENAI_API_KEY (Optionnel)
- **Key**: `OPENAI_API_KEY`
- **Value**: Votre clé API OpenAI (si vous avez un compte)
- ⚠️ Si vous n'avez pas de clé OpenAI, vous pouvez laisser cette variable vide ou ne pas l'ajouter
- Cliquez sur **"Save"**

#### Variable 6 : CORS_ORIGIN (Important pour le Frontend)
- **Key**: `CORS_ORIGIN`
- **Value**: L'URL de votre frontend Render (vous l'obtiendrez après le déploiement du frontend)
  - Exemple : `https://issatkr-frontend.onrender.com`
- ⚠️ **Note** : Vous pouvez d'abord déployer sans cette variable, puis l'ajouter après avoir déployé le frontend
- Cliquez sur **"Save"**

### 3.5 Choisir le Plan

- Sélectionnez **"Free"** (plan gratuit)
- ⚠️ Note : Le plan gratuit s'arrête après 15 minutes d'inactivité

### 3.6 Lancer le Déploiement du Backend

1. Vérifiez que toutes les variables d'environnement sont ajoutées
2. Cliquez sur **"Create Web Service"**
3. ⏳ Attendez 3-5 minutes pendant que Render :
   - Clone votre dépôt
   - Installe les dépendances du serveur
   - Démarre le serveur
4. Une fois terminé, notez l'URL de votre backend : `https://issatkr-backend.onrender.com`

---

## ÉTAPE 4 : Déployer le Frontend (React App)

### 4.1 Créer un Nouveau Web Service pour le Frontend

1. Dans le dashboard Render, cliquez sur **"New +"** (en haut à droite)
2. Sélectionnez **"Web Service"**

### 4.2 Connecter le Dépôt GitHub

1. Sélectionnez le même dépôt : **`issatkrplat`**
2. Cliquez sur **"Connect"**

### 4.3 Configurer le Service Frontend

Remplissez les champs suivants :

**Basic Settings:**
- **Name**: `issatkr-frontend` (ou `issatkr-app`)
- **Region**: Choisissez la **même région** que le backend
- **Branch**: `main` (ou `master` selon votre dépôt)
- **Root Directory**: `client` ⚠️ **IMPORTANT : Spécifiez le dossier client**

**Build & Deploy:**
- **Environment**: `Node`
- **Build Command**: 
  ```bash
  npm install && npm run build
  ```
- **Start Command**: 
  ```bash
  npm run preview
  ```
  ⚠️ **OU** si vous préférez servir les fichiers statiques :
  ```bash
  npx serve -s dist -l 10000
  ```

### 4.4 Ajouter les Variables d'Environnement pour le Frontend

Cliquez sur **"Advanced"** → **"Add Environment Variable"** et ajoutez :

#### Variable 1 : VITE_API_URL
- **Key**: `VITE_API_URL`
- **Value**: L'URL de votre backend Render (de l'étape 3.6)
  ```
  https://issatkr-backend.onrender.com/api
  ```
- ⚠️ **IMPORTANT** : Remplacez `issatkr-backend` par le nom réel de votre service backend
- Cliquez sur **"Save"**

#### Variable 2 : NODE_ENV (Optionnel)
- **Key**: `NODE_ENV`
- **Value**: `production`
- Cliquez sur **"Save"**

### 4.5 Choisir le Plan

- Sélectionnez **"Free"** (plan gratuit)

### 4.6 Lancer le Déploiement du Frontend

1. Vérifiez que la variable `VITE_API_URL` pointe vers votre backend
2. Cliquez sur **"Create Web Service"**
3. ⏳ Attendez 5-10 minutes pendant que Render :
   - Clone votre dépôt
   - Installe les dépendances du client
   - Build le frontend React
   - Démarre le serveur de preview
4. Une fois terminé, notez l'URL de votre frontend : `https://issatkr-frontend.onrender.com`

---

## ÉTAPE 5 : Finaliser la Configuration

### 5.1 Mettre à jour CORS dans le Backend

1. Retournez dans votre service backend sur Render
2. Allez dans **"Environment"**
3. Mettez à jour la variable `CORS_ORIGIN` avec l'URL de votre frontend :
   ```
   https://issatkr-frontend.onrender.com
   ```
4. Cliquez sur **"Save Changes"**
5. Un redéploiement automatique sera déclenché

### 5.2 Vérifier les URLs

- **Backend API** : `https://issatkr-backend.onrender.com`
- **Frontend App** : `https://issatkr-frontend.onrender.com`
- **Health Check** : `https://issatkr-backend.onrender.com/api/health`

### 5.3 Tester l'Application

1. Ouvrez l'URL du frontend dans votre navigateur
2. Vérifiez que la page d'accueil se charge
3. Testez la connexion à l'API (essayez de vous connecter)
4. Vérifiez les logs dans Render si quelque chose ne fonctionne pas

---

## ÉTAPE 6 : Peupler la Base de Données (Optionnel)

Pour avoir des données de test (utilisateurs, modules, etc.) :

### Option A : Via le Script Seed Local

1. Créez un fichier `.env` local dans le dossier `server` :
   ```env
   MONGODB_URI=votre-uri-mongodb-atlas
   JWT_SECRET=votre-jwt-secret
   ```
2. Exécutez le script seed :
   ```bash
   cd server
   npm run seed
   ```

### Option B : Créer un Utilisateur Admin Manuellement

1. Connectez-vous à MongoDB Atlas
2. Allez dans **"Database"** → **"Browse Collections"**
3. Créez une collection `users`
4. Ajoutez un document avec :
   ```json
   {
     "email": "admin@issatkr.tn",
     "password": "hashed_password_here",
     "role": "admin",
     "firstName": "Admin",
     "lastName": "ISSAT"
   }
   ```
   ⚠️ Le mot de passe doit être hashé avec bcrypt

---

## 🔧 Dépannage

### Le déploiement du backend échoue

1. **Vérifiez les logs** dans Render → "Logs"
2. **Erreur de build** :
   - Vérifiez que le **Root Directory** est bien `server`
   - Vérifiez que toutes les dépendances sont dans `server/package.json`
3. **Erreur de connexion MongoDB** :
   - Vérifiez que l'URI MongoDB est correcte
   - Vérifiez que l'accès réseau dans MongoDB Atlas autorise `0.0.0.0/0`
   - Vérifiez que le nom d'utilisateur et mot de passe sont corrects

### Le déploiement du frontend échoue

1. **Vérifiez les logs** dans Render → "Logs"
2. **Erreur de build** :
   - Vérifiez que le **Root Directory** est bien `client`
   - Vérifiez que toutes les dépendances sont dans `client/package.json`
   - Vérifiez que `VITE_API_URL` est bien définie
3. **Erreur TypeScript** :
   - Les erreurs TypeScript peuvent être ignorées si le build Vite réussit
   - Vérifiez que `tsconfig.json` a `"strict": false` pour éviter les erreurs strictes

### Le frontend ne peut pas se connecter au backend

1. **Vérifiez que `VITE_API_URL`** pointe vers la bonne URL du backend
2. **Vérifiez CORS** :
   - Assurez-vous que `CORS_ORIGIN` dans le backend contient l'URL du frontend
   - Vérifiez les logs du backend pour les erreurs CORS
3. **Vérifiez que le backend est en ligne** :
   - Testez l'endpoint `/api/health` du backend
   - Vérifiez que le backend n'est pas en "sleeping" (plan gratuit)

### Erreur 404 sur les routes React

1. Pour le frontend, assurez-vous que le serveur sert bien `index.html` pour toutes les routes
2. Si vous utilisez `serve`, utilisez : `npx serve -s dist -l 10000`
   - Le flag `-s` sert `index.html` pour toutes les routes

---

## 📝 Notes Importantes

### Plan Gratuit Render

- ⏰ **Spinning down** : Les services s'arrêtent après 15 minutes d'inactivité
- 🐌 **Démarrage lent** : Le premier accès après un arrêt peut prendre 30-60 secondes
- 💾 **Limites** : 512 MB RAM, 0.5 CPU par service
- 📊 **Logs** : Conservés pendant 7 jours
- 🔗 **Deux services** : Vous avez 2 services gratuits (parfait pour frontend + backend)

### Mises à Jour

Pour mettre à jour l'application :
1. Poussez vos modifications sur GitHub
2. Render détectera automatiquement les changements
3. Un nouveau déploiement sera déclenché automatiquement pour chaque service
4. Vous pouvez aussi cliquer sur **"Manual Deploy"** → **"Deploy latest commit"**

### Variables d'Environnement

Pour modifier les variables d'environnement :
1. Allez dans votre service Render
2. Cliquez sur **"Environment"**
3. Modifiez ou ajoutez des variables
4. Cliquez sur **"Save Changes"**
5. Un redéploiement automatique sera déclenché

### URLs des Services

Après le déploiement, vous aurez :
- **Backend** : `https://issatkr-backend.onrender.com`
- **Frontend** : `https://issatkr-frontend.onrender.com`

⚠️ **Important** : Remplacez `issatkr-backend` et `issatkr-frontend` par les noms réels que vous avez donnés à vos services.

---

## 🎯 Checklist de Déploiement

Avant de considérer le déploiement comme terminé, vérifiez :

### Backend
- [ ] MongoDB Atlas est configuré et accessible
- [ ] Toutes les variables d'environnement sont définies dans Render
- [ ] Le build se termine sans erreur
- [ ] L'application démarre correctement (vérifiez les logs)
- [ ] L'URL du backend est accessible
- [ ] L'endpoint `/api/health` fonctionne
- [ ] La connexion à MongoDB fonctionne

### Frontend
- [ ] La variable `VITE_API_URL` pointe vers le backend
- [ ] Le build se termine sans erreur
- [ ] L'application démarre correctement (vérifiez les logs)
- [ ] L'URL du frontend est accessible
- [ ] Le frontend se charge correctement
- [ ] Les routes React fonctionnent (pas d'erreur 404)

### Configuration
- [ ] CORS est configuré dans le backend avec l'URL du frontend
- [ ] Vous pouvez vous connecter (si vous avez créé un utilisateur)
- [ ] Les appels API fonctionnent depuis le frontend

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. **Consultez les logs** dans Render Dashboard → Logs (pour chaque service)
2. **Vérifiez la documentation** : https://render.com/docs
3. **Vérifiez MongoDB Atlas** : https://docs.atlas.mongodb.com
4. **Vérifiez les fichiers de configuration** :
   - `server/server.js`
   - `client/src/services/api.ts`
   - `client/vite.config.ts`

---

## ✅ Résultat Final

Une fois tout configuré, vous aurez :

- **Backend API** : `https://issatkr-backend.onrender.com`
- **Frontend App** : `https://issatkr-frontend.onrender.com`

Et vous pourrez :
- ✅ Accéder à la page d'accueil depuis le frontend
- ✅ Vous connecter (si vous avez créé un utilisateur)
- ✅ Utiliser toutes les fonctionnalités de la plateforme
- ✅ Accéder depuis n'importe où dans le monde !

---

## 🔄 Architecture Déployée

```
┌─────────────────────────────────────┐
│   Frontend (React + Vite)           │
│   https://issatkr-frontend.onrender.com │
│   - Sert les fichiers statiques     │
│   - Appels API vers le backend      │
└──────────────┬──────────────────────┘
               │
               │ HTTP Requests
               │
┌──────────────▼──────────────────────┐
│   Backend (Node.js + Express)        │
│   https://issatkr-backend.onrender.com │
│   - API REST                         │
│   - Authentification                 │
│   - Logique métier                   │
└──────────────┬──────────────────────┘
               │
               │ MongoDB Connection
               │
┌──────────────▼──────────────────────┐
│   MongoDB Atlas (Cloud Database)     │
│   - Stockage des données             │
│   - Utilisateurs, modules, etc.      │
└─────────────────────────────────────┘
```

---

**Bon déploiement ! 🚀**

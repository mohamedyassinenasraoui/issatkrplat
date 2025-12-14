# 🚀 Guide de Déploiement Étape par Étape - ISSAT Kairouan Platform

Ce guide vous explique **exactement** comment déployer la plateforme ISSAT Kairouan sur Render gratuitement.

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

## ÉTAPE 3 : Déployer l'Application sur Render

### 3.1 Créer un Nouveau Web Service

1. Dans le dashboard Render, cliquez sur **"New +"** (en haut à droite)
2. Sélectionnez **"Web Service"**

### 3.2 Connecter le Dépôt GitHub

1. Si c'est votre première fois, cliquez sur **"Connect GitHub"**
2. Autorisez Render à accéder à vos dépôts
3. Dans la liste des dépôts, cherchez et sélectionnez : **`issatkrplat`**
4. Cliquez sur **"Connect"**

### 3.3 Configurer le Service

Remplissez les champs suivants :

**Basic Settings:**
- **Name**: `issatkr-platform` (ou un nom de votre choix)
- **Region**: Choisissez la région la plus proche (ex: `Frankfurt` pour l'Europe)
- **Branch**: `main` (ou `master` selon votre dépôt)
- **Root Directory**: (laissez vide)

**Build & Deploy:**
- **Environment**: `Node`
- **Build Command**: 
  ```bash
  cd server && npm install && cd ../client && npm install && npm run build
  ```
- **Start Command**: 
  ```bash
  cd server && npm start
  ```

### 3.4 Ajouter les Variables d'Environnement

Cliquez sur **"Advanced"** → **"Add Environment Variable"** et ajoutez :

#### Variable 1 : NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`
- Cliquez sur **"Save"**

#### Variable 2 : MONGODB_URI
- **Key**: `MONGODB_URI`
- **Value**: Collez l'URI MongoDB que vous avez copiée à l'étape 1.5
  ```
  mongodb+srv://issatkr-admin:VotreMotDePasse@cluster0.xxxxx.mongodb.net/issatkr?retryWrites=true&w=majority
  ```
- Cliquez sur **"Save"**

#### Variable 3 : JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: Générez une clé secrète sécurisée
  - Sur Windows (PowerShell) :
    ```powershell
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    ```
  - Ou utilisez un générateur en ligne : https://randomkeygen.com/
  - Copiez une chaîne de 128 caractères
- Cliquez sur **"Save"**

#### Variable 4 : OPENAI_API_KEY (Optionnel)
- **Key**: `OPENAI_API_KEY`
- **Value**: Votre clé API OpenAI (si vous avez un compte)
- ⚠️ Si vous n'avez pas de clé OpenAI, vous pouvez laisser cette variable vide ou ne pas l'ajouter
- Cliquez sur **"Save"**

### 3.5 Choisir le Plan

- Sélectionnez **"Free"** (plan gratuit)
- ⚠️ Note : Le plan gratuit s'arrête après 15 minutes d'inactivité

### 3.6 Lancer le Déploiement

1. Vérifiez que toutes les variables d'environnement sont ajoutées
2. Cliquez sur **"Create Web Service"**
3. ⏳ Attendez 5-10 minutes pendant que Render :
   - Clone votre dépôt
   - Installe les dépendances du serveur
   - Installe les dépendances du client
   - Build le frontend React
   - Démarre le serveur

### 3.7 Vérifier le Déploiement

1. Une fois le déploiement terminé, vous verrez :
   - ✅ Status: **Live**
   - 🌐 Votre URL : `https://issatkr-platform.onrender.com`
2. Cliquez sur l'URL pour ouvrir votre application
3. 🎉 Félicitations ! Votre application est en ligne !

---

## ÉTAPE 4 : Peupler la Base de Données (Optionnel)

Pour avoir des données de test (utilisateurs, modules, etc.) :

### Option A : Via le Script Seed (Recommandé)

1. Dans Render, allez dans votre service
2. Cliquez sur **"Shell"** (si disponible) ou utilisez votre terminal local
3. Exécutez :
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

### Le déploiement échoue

1. **Vérifiez les logs** dans Render → "Logs"
2. **Erreur de build** :
   - Vérifiez que toutes les dépendances sont dans `package.json`
   - Vérifiez que les commandes de build sont correctes
3. **Erreur de connexion MongoDB** :
   - Vérifiez que l'URI MongoDB est correcte
   - Vérifiez que l'accès réseau dans MongoDB Atlas autorise `0.0.0.0/0`
   - Vérifiez que le nom d'utilisateur et mot de passe sont corrects

### L'application ne démarre pas

1. Vérifiez les logs dans Render
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez que le PORT est bien utilisé (Render définit automatiquement `process.env.PORT`)

### Le frontend ne se charge pas

1. Vérifiez que le build du client s'est bien terminé
2. Vérifiez que le dossier `client/dist` existe après le build
3. Vérifiez les logs de build dans Render

### Erreur 404 sur les routes React

1. Vérifiez que le serveur sert bien les fichiers statiques en production
2. Vérifiez que la route `*` est bien configurée dans `server.js`

---

## 📝 Notes Importantes

### Plan Gratuit Render

- ⏰ **Spinning down** : Le service s'arrête après 15 minutes d'inactivité
- 🐌 **Démarrage lent** : Le premier accès après un arrêt peut prendre 30-60 secondes
- 💾 **Limites** : 512 MB RAM, 0.5 CPU
- 📊 **Logs** : Conservés pendant 7 jours

### Mises à Jour

Pour mettre à jour l'application :
1. Poussez vos modifications sur GitHub
2. Render détectera automatiquement les changements
3. Un nouveau déploiement sera déclenché automatiquement
4. Vous pouvez aussi cliquer sur **"Manual Deploy"** → **"Deploy latest commit"**

### Variables d'Environnement

Pour modifier les variables d'environnement :
1. Allez dans votre service Render
2. Cliquez sur **"Environment"**
3. Modifiez ou ajoutez des variables
4. Cliquez sur **"Save Changes"**
5. Un redéploiement automatique sera déclenché

---

## 🎯 Checklist de Déploiement

Avant de considérer le déploiement comme terminé, vérifiez :

- [ ] MongoDB Atlas est configuré et accessible
- [ ] Toutes les variables d'environnement sont définies dans Render
- [ ] Le build se termine sans erreur
- [ ] L'application démarre correctement (vérifiez les logs)
- [ ] L'URL de l'application est accessible
- [ ] Le frontend se charge correctement
- [ ] Les routes API fonctionnent (`/api/health`)
- [ ] La connexion à MongoDB fonctionne
- [ ] Vous pouvez vous connecter (si vous avez créé un utilisateur)

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. **Consultez les logs** dans Render Dashboard → Logs
2. **Vérifiez la documentation** : https://render.com/docs
3. **Vérifiez MongoDB Atlas** : https://docs.atlas.mongodb.com
4. **Vérifiez les fichiers de configuration** :
   - `render.yaml`
   - `server/server.js`
   - `client/src/services/api.ts`

---

## ✅ Résultat Final

Une fois tout configuré, votre application sera accessible sur :
```
https://issatkr-platform.onrender.com
```

Et vous pourrez :
- ✅ Accéder à la page d'accueil
- ✅ Vous connecter (si vous avez créé un utilisateur)
- ✅ Utiliser toutes les fonctionnalités de la plateforme
- ✅ Accéder depuis n'importe où dans le monde !

---

**Bon déploiement ! 🚀**


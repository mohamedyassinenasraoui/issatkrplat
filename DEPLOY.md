# Guide de Déploiement sur Render

Ce guide vous explique comment déployer la plateforme ISSAT Kairouan sur Render gratuitement.

## Prérequis

1. Un compte GitHub avec le code poussé
2. Un compte Render (gratuit) : https://render.com
3. Un compte MongoDB Atlas (gratuit) : https://www.mongodb.com/cloud/atlas

## Étapes de Déploiement

### 1. Configuration MongoDB Atlas

1. Créez un compte sur MongoDB Atlas
2. Créez un nouveau cluster (choisissez le plan gratuit M0)
3. Créez un utilisateur de base de données
4. Configurez l'accès réseau (ajoutez `0.0.0.0/0` pour permettre toutes les IP)
5. Récupérez votre URI de connexion (format : `mongodb+srv://username:password@cluster.mongodb.net/issatkr`)

### 2. Configuration sur Render

1. Connectez-vous à Render : https://dashboard.render.com
2. Cliquez sur "New +" → "Web Service"
3. Connectez votre dépôt GitHub
4. Sélectionnez le dépôt `issatkrplat`

### 3. Configuration du Service

Configurez les paramètres suivants :

- **Name**: `issatkr-platform`
- **Environment**: `Node`
- **Region**: Choisissez la région la plus proche
- **Branch**: `main`
- **Root Directory**: (laissez vide)
- **Build Command**: 
  ```bash
  cd server && npm install && cd ../client && npm install && npm run build
  ```
- **Start Command**: 
  ```bash
  cd server && npm start
  ```

### 4. Variables d'Environnement

Ajoutez les variables d'environnement suivantes dans la section "Environment" :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `NODE_ENV` | `production` | Environnement de production |
| `PORT` | `10000` | Port (Render définit automatiquement, mais on peut spécifier) |
| `MONGODB_URI` | `mongodb+srv://...` | URI de connexion MongoDB Atlas |
| `JWT_SECRET` | `votre-secret-jwt-tres-securise` | Clé secrète pour JWT (générez une chaîne aléatoire) |
| `OPENAI_API_KEY` | `sk-...` | Clé API OpenAI (optionnel, pour l'assistant IA) |

**Note**: Pour générer un JWT_SECRET sécurisé, vous pouvez utiliser :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Déploiement

1. Cliquez sur "Create Web Service"
2. Render va automatiquement :
   - Cloner votre dépôt
   - Installer les dépendances
   - Builder le frontend
   - Démarrer le serveur
3. Attendez que le déploiement se termine (5-10 minutes)

### 6. Configuration Post-Déploiement

Une fois déployé, vous obtiendrez une URL comme : `https://issatkr-platform.onrender.com`

#### Mise à jour de l'URL de l'API dans le client

Si nécessaire, mettez à jour l'URL de l'API dans `client/src/services/api.ts` pour pointer vers votre URL Render.

### 7. Seed de la Base de Données (Optionnel)

Pour peupler la base de données avec des données initiales, vous pouvez :

1. Se connecter en SSH à votre instance Render (si disponible)
2. Ou exécuter le script seed localement en pointant vers MongoDB Atlas

## Plan Gratuit Render - Limitations

- **Spinning down**: Après 15 minutes d'inactivité, le service s'arrête
- **Démarrage lent**: Le premier accès après un arrêt peut prendre 30-60 secondes
- **Limites de ressources**: 512 MB RAM, 0.5 CPU

## Mise à Jour

Pour mettre à jour l'application :

1. Poussez vos modifications sur GitHub
2. Render détectera automatiquement les changements
3. Un nouveau déploiement sera déclenché automatiquement

## Dépannage

### Le service ne démarre pas

- Vérifiez les logs dans le dashboard Render
- Vérifiez que toutes les variables d'environnement sont définies
- Vérifiez que MongoDB Atlas autorise les connexions depuis Render

### Erreurs de connexion MongoDB

- Vérifiez que l'IP de Render est autorisée dans MongoDB Atlas (ou utilisez `0.0.0.0/0`)
- Vérifiez que l'URI MongoDB est correcte
- Vérifiez que l'utilisateur MongoDB a les bonnes permissions

### Le frontend ne se charge pas

- Vérifiez que le build du client s'est bien terminé
- Vérifiez que le dossier `client/dist` existe après le build
- Vérifiez les logs de build dans Render

## Support

Pour plus d'aide, consultez :
- Documentation Render : https://render.com/docs
- Documentation MongoDB Atlas : https://docs.atlas.mongodb.com


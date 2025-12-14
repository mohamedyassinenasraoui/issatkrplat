# 🚀 Déploiement sur Render - Guide Rapide

## Étapes Rapides

### 1. Préparer MongoDB Atlas (Gratuit)

1. Créez un compte sur https://www.mongodb.com/cloud/atlas
2. Créez un cluster gratuit (M0)
3. Créez un utilisateur de base de données
4. Configurez l'accès réseau : ajoutez `0.0.0.0/0` (toutes les IP)
5. Copiez votre URI de connexion : `mongodb+srv://username:password@cluster.mongodb.net/issatkr`

### 2. Déployer sur Render

1. Allez sur https://dashboard.render.com
2. Cliquez sur "New +" → "Web Service"
3. Connectez votre dépôt GitHub : `mohamedyassinenasraoui/issatkrplat`
4. Configurez :

   **Build Command:**
   ```bash
   cd server && npm install && cd ../client && npm install && npm run build
   ```

   **Start Command:**
   ```bash
   cd server && npm start
   ```

5. Ajoutez les variables d'environnement :

   | Variable | Valeur |
   |----------|--------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Votre URI MongoDB Atlas |
   | `JWT_SECRET` | Générez avec : `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
   | `OPENAI_API_KEY` | (Optionnel) Votre clé OpenAI |

6. Cliquez sur "Create Web Service"
7. Attendez 5-10 minutes pour le déploiement

### 3. Votre application sera disponible sur :
`https://issatkr-platform.onrender.com`

## ⚠️ Notes Importantes

- **Plan Gratuit**: Le service s'arrête après 15 min d'inactivité
- **Premier démarrage**: Peut prendre 30-60 secondes après un arrêt
- **Mises à jour**: Push sur GitHub déclenche automatiquement un redéploiement

## 📚 Documentation Complète

Voir `DEPLOY.md` pour plus de détails.


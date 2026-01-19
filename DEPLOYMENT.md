# Guide de déploiement sur Vercel

## 📁 Structure mise en place

```
mangascan/
├── api/
│   ├── anime-sama.ts      # Serverless function pour le proxy
│   └── tsconfig.json       # Config TypeScript pour l'API
├── vercel.json             # Configuration Vercel
├── .vercelignore          # Fichiers à ignorer
└── .gitignore             # Fichiers Git à ignorer
```

## 🚀 Déploiement

### 1. Commit et push vos changements

```bash
git add .
git commit -m "Add Vercel serverless proxy for anime-sama API"
git push
```

### 2. Déployer sur Vercel

Si vous avez déjà un projet Vercel :
```bash
vercel --prod
```

Ou via l'interface web Vercel :
1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. Cliquez sur "Deployments"
4. Le nouveau déploiement se fera automatiquement

### 3. Vérifier que ça fonctionne

Testez votre API :
```
https://votre-app.vercel.app/api/anime-sama/get_nb_chap_et_img.php?oeuvre=One%20Piece
```

## 🔧 Comment ça marche

### En développement (local)
Le proxy Vite dans `vite.config.ts` redirige `/api/anime-sama/*` vers `anime-sama.si`

### En production (Vercel)
La serverless function dans `api/anime-sama.ts` gère toutes les requêtes vers `/api/anime-sama/*`

## 🐛 Debug

Si vous avez des erreurs 403 ou CORS :
1. Vérifiez les logs dans le dashboard Vercel
2. Les logs de la fonction serverless affichent chaque requête
3. Vérifiez que le `vercel.json` est bien déployé

## 📝 Notes importantes

- La fonction serverless ajoute automatiquement les headers nécessaires pour simuler un navigateur
- Les images sont mises en cache pour 1 an (immutable)
- Les requêtes JSON sont automatiquement parsées
- Timeout par défaut : 10 secondes (peut être augmenté dans les settings Vercel)

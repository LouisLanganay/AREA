# Étape 1 : Utiliser une image Node.js légère et stable
FROM node:18-alpine

# Étape 2 : Définir un utilisateur non-root pour plus de sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Étape 3 : Définir le répertoire de travail
WORKDIR /server

# Étape 4 : Copier les fichiers nécessaires pour l'installation des dépendances
COPY ./src/server/package.json ./src/server/package-lock.json ./

# Étape 5 : Installer uniquement les dépendances nécessaires pour la production
RUN npm install --only=production

# Étape 6 : Copier le reste des fichiers sources et partagés
COPY ./src/server .
COPY ./src/shared ./shared

# Étape 7 : Construire le projet
RUN npm run build

# Étape 8 : Exposer le port de l'application
EXPOSE 8080

# Étape 9 : Configurer le conteneur pour s'exécuter en tant qu'utilisateur non-root
USER appuser

# Étape 10 : Ajouter des options de sécurité et définir la commande par défaut
CMD ["npm", "run", "start:prod"]

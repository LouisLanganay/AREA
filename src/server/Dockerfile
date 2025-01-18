FROM node:21.7.0

# Installer Redis et ngrok
RUN apt-get update && apt-get install -y redis-server && \
    curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | tee /etc/apt/sources.list.d/ngrok.list && \
    apt-get update && apt-get install -y ngrok

# Définir le dossier de travail
WORKDIR /server

# Copier les fichiers package.json et installer les dépendances
COPY package*.json ./
RUN npm i

# Copier le reste des fichiers
COPY . .

# Rendre le script de démarrage exécutable
RUN chmod +x startup.sh

# Exposer les ports nécessaires
EXPOSE 8080 6379

CMD sh -c 'redis-server --daemonize yes --protected-mode no && \
                      echo "------------------------------------" && \
                      echo "Installing and configuring ngrok" && \
                      ngrok config add-authtoken 2ro1aA49aPIE6kNq3oDPVH0LcH5_3LnJ4Mwnm2gv886prw1EC && \
                      ngrok http --url=grown-sawfly-notably.ngrok-free.app 8080 & \
                      echo "------------------------------------" && \
                      echo "Before Prisma Migrate" && \
                      until npx prisma migrate deploy; do echo "Retrying Prisma Migrate"; sleep 5; done && \
                      npx prisma generate && \
                      echo "After Prisma Migrate" && \
                      npm run start'

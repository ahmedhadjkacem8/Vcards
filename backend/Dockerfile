# ------------------------------
# Étape 1 : Builder le backend
# ------------------------------
FROM node:20-alpine AS builder

# Définir le dossier de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm install --include=dev

# Copier le reste des fichiers
COPY . .

# Créer le dossier uploads pour multer
RUN mkdir -p /app/uploads

# Compiler le projet TypeScript
RUN npm run build

# ------------------------------
# Étape 2 : Image finale
# ------------------------------
FROM node:20-alpine

WORKDIR /app

# Copier le build, les node_modules et uploads
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/package*.json ./

# Télécharger wait-for-it pour attendre MySQL
COPY --from=builder /app/wait-for-it.sh ./wait-for-it.sh
RUN chmod +x ./wait-for-it.sh

# Exposer le port du backend
EXPOSE 4000

# Commande pour attendre MySQL puis démarrer le serveur
CMD ["./wait-for-it.sh", "db:3306", "--", "node", "dist/server.js"]

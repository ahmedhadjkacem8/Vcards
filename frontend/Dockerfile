# Étape 1 : Node.js pour builder le frontend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Étape 2 : Nginx pour servir le build
FROM nginx:alpine

# Copier le build React
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier ta configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

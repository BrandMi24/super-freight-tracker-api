# api/Dockerfile
FROM node:20-alpine

# Imagen oficial de Playwright (ya trae Chromium/Firefox/WebKit instalados)
FROM mcr.microsoft.com/playwright:v1.50.0-jammy

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias (solo prod si quieres más ligera la imagen)
RUN npm ci

# Copiar el resto del código
COPY . .

# Variables de entorno por defecto (se sobreescriben con .env / compose)
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Ajusta este comando si tu script "start" es diferente
CMD ["npm", "start"]

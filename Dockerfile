# api/Dockerfile

# Imagen oficial de Playwright para la versión 1.57.0
FROM mcr.microsoft.com/playwright:v1.57.0-jammy

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Arrancar la API
CMD ["npm", "start"]

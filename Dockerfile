FROM ghcr.io/puppeteer/puppeteer:latest

# Cambiar a usuario root para instalar dependencias si faltan
USER root

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Comando para iniciar el bot
CMD ["node", "index.js"]

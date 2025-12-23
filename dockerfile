FROM node:20-slim

# Evita prompts interativos
ENV DEBIAN_FRONTEND=noninteractive

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instala yt-dlp (binário oficial)
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -o /usr/local/bin/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp

# Confirma instalação
RUN yt-dlp --version && ffmpeg -version

WORKDIR /app

# Dependências primeiro (cache)
COPY package.json package-lock.json ./
RUN npm install

# Copia o resto do projeto
COPY . .

# Build do Next
RUN npm run build

# Porta padrão
EXPOSE 3000

# Next em modo produção
CMD ["npm", "start"]

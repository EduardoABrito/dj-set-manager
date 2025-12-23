FROM node:20

# Atualiza e instala yt-dlp
RUN apt update && apt install -y yt-dlp ffmpeg

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]

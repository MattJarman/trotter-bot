FROM node:13-alpine
RUN apk update && \
    apk add ffmpeg && \
    mkdir -p /home/node/app/node_modules && \ 
    chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
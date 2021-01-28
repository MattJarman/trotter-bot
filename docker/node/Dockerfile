FROM node:12-alpine
RUN apk update && \
    apk add git python make g++ && \
    mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install
USER node
COPY --chown=node:node . .

FROM node:12-alpine
RUN apk update && \
    apk add git python make g++ && \
    mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .

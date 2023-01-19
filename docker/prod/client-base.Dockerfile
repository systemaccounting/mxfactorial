FROM node:lts-alpine

WORKDIR /app

COPY client/package*.json ./

RUN npm install
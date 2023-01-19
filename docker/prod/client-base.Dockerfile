FROM node:lts-alpine

WORKDIR /app

COPY client/package.json .
COPY client/package-lock.json .

RUN npm install
FROM node:19-buster-slim

EXPOSE 8080

WORKDIR /app

COPY . .

WORKDIR /app/services/rules

RUN npm install

CMD [ "npm", "run", "docker" ]
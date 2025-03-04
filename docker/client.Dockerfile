FROM mxfactorial/client-base:v1 AS builder1

ARG PUBLIC_POOL_ID
ARG PUBLIC_CLIENT_ID
ARG PUBLIC_GRAPHQL_URI
ARG PUBLIC_DOMAIN
ARG PORT

WORKDIR /app

COPY client .

# WARNING: docker build was failing to COPY package*.json with unstaged
# changes on macos so npm install may be required before npm run build:
# RUN npm install
RUN npm run build

FROM node:lts-alpine
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=builder1 /app/build /app
COPY --from=builder1 /app/package.json /app
COPY --from=builder1 /app/package-lock.json /app

WORKDIR /app

CMD ["node", "index.js"]
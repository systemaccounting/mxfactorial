FROM public.ecr.aws/docker/library/node:lts-alpine AS builder

ARG PUBLIC_POOL_ID
ARG PUBLIC_CLIENT_ID
ARG PUBLIC_GRAPHQL_URI
ARG PUBLIC_GOOGLE_MAPS_API_KEY
ARG PUBLIC_GRAPHQL_RESOURCE
ARG PUBLIC_GRAPHQL_WS_RESOURCE
ARG PORT

WORKDIR /app

COPY client/package*.json ./
RUN npm install

COPY client .
RUN npm run build

FROM public.ecr.aws/docker/library/node:lts-alpine
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=builder /app/build /app
COPY --from=builder /app/package.json /app
COPY --from=builder /app/package-lock.json /app

WORKDIR /app

CMD ["node", "index.js"]

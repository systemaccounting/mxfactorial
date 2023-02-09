FROM mxfactorial/client-base:v1 as builder1

ARG GRAPHQL_URI

COPY client .

RUN printf "ENABLE_AUTH=false\nGRAPHQL_URI=$GRAPHQL_URI\n" > .env

RUN npm run build

FROM nginx:latest

EXPOSE 80

COPY --from=builder1 /app/.svelte-kit/output/prerendered/pages/index.html /usr/share/nginx/html

COPY --from=builder1 /app/.svelte-kit/output/client/ /usr/share/nginx/html

COPY --from=builder1 /app/nginx.conf /etc/nginx/conf.d/default.conf
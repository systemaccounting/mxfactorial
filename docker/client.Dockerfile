FROM mxfactorial/client-base:v1 AS builder1

ARG GRAPHQL_URI=aHR0cDovL2xvY2FsaG9zdDoxMDAwMAo=

COPY client .

RUN printf "ENABLE_API_AUTH=false\nGRAPHQL_URI=$GRAPHQL_URI\n" > .env

RUN npm run build

FROM nginx:latest

EXPOSE 80

COPY --from=builder1 /app/entrypoint.sh /docker-entrypoint.d/40-set-env-vars.sh

RUN chmod +x /docker-entrypoint.d/40-set-env-vars.sh

COPY --from=builder1 /app/.svelte-kit/output/prerendered/pages/index.html /usr/share/nginx/html

COPY --from=builder1 /app/.svelte-kit/output/client/ /usr/share/nginx/html

COPY --from=builder1 /app/nginx.conf /etc/nginx/conf.d/default.conf
FROM mxfactorial/client-base:v1 as builder1

ARG GRAPHQL_URI=aHR0cDovL2xvY2FsaG9zdDo4MDgw

COPY client .

RUN printf "ENABLE_AUTH=false\nGRAPHQL_URI=$GRAPHQL_URI\n" > .env

RUN npm run build

FROM nginx:latest

EXPOSE 80

COPY --from=builder1 /app/public /usr/share/nginx/html

COPY client/nginx.conf /etc/nginx/conf.d/default.conf
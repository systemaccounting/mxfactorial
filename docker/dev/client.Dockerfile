FROM mxfactorial/client-base:v1 as builder1

COPY client .

RUN printf 'ENABLE_AUTH=false\nGRAPHQL_URI=aHR0cDovLzAuMC4wLjA6ODA4OA==\n' > .env

RUN npm run build

FROM nginx:latest

EXPOSE 80

COPY --from=builder1 /app/public /usr/share/nginx/html

COPY client/nginx.conf /etc/nginx/conf.d/default.conf
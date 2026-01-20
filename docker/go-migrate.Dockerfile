FROM public.ecr.aws/docker/library/alpine:latest AS builder

ARG VERSION=v4.17.0
ARG ARCH=linux-amd64

WORKDIR /tmp

RUN apk add --no-cache curl tar gzip && \
	curl -LO https://github.com/golang-migrate/migrate/releases/download/${VERSION}/migrate.${ARCH}.tar.gz && \
	tar -xvf migrate.${ARCH}.tar.gz && \
	chmod +x migrate

WORKDIR /staging
COPY migrations/go-migrate/bootstrap runtime/
COPY migrations/go-migrate/function.sh task/
COPY migrations/go-migrate/migrate.sh task/
COPY migrations/schema task/migrations/schema
COPY migrations/seed task/migrations/seed
COPY migrations/testseed task/migrations/testseed

FROM public.ecr.aws/lambda/provided:al2023

COPY --from=builder /tmp/migrate /usr/local/bin/migrate
COPY --from=builder /staging/runtime/ ${LAMBDA_RUNTIME_DIR}
COPY --from=builder /staging/task/ ${LAMBDA_TASK_ROOT}

RUN dnf install -y postgresql15 jq && \
	dnf clean all && \
	rm -rf /var/cache/dnf && \
	chmod +x ${LAMBDA_RUNTIME_DIR}/bootstrap && \
	chmod +x ${LAMBDA_TASK_ROOT}/function.sh && \
	chmod +x ${LAMBDA_TASK_ROOT}/migrate.sh

WORKDIR /var/task

CMD [ "function.handler" ]
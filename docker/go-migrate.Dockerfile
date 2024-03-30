FROM public.ecr.aws/lambda/provided:al2023

ARG VERSION=v4.17.0
ARG ARCH=linux-amd64

COPY bootstrap ${LAMBDA_RUNTIME_DIR}
COPY function.sh ${LAMBDA_TASK_ROOT}
COPY migrate.sh ${LAMBDA_TASK_ROOT}

WORKDIR /tmp

RUN dnf install -y tar gzip git jq postgresql15 && \
	dnf clean all && \
	curl -LO https://github.com/golang-migrate/migrate/releases/download/${VERSION}/migrate.${ARCH}.tar.gz && \
	tar -xvf migrate.${ARCH}.tar.gz -C /usr/local/bin/ && \
	rm -rf /tmp/* && \
	chmod +x ${LAMBDA_RUNTIME_DIR}/bootstrap && \
	chmod +x ${LAMBDA_TASK_ROOT}/function.sh && \
	chmod +x ${LAMBDA_TASK_ROOT}/migrate.sh

WORKDIR /var/task

CMD [ "function.handler" ]
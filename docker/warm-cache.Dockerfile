FROM public.ecr.aws/lambda/provided:al2023

RUN dnf install -y postgresql15 jq redis6 awscli-2 && \
	dnf clean all && \
	rm -rf /var/cache/dnf

COPY migrations/warm-cache/bootstrap ${LAMBDA_RUNTIME_DIR}/
COPY migrations/warm-cache/function.sh ${LAMBDA_TASK_ROOT}/
COPY migrations/warm-cache/warm-cache.sh ${LAMBDA_TASK_ROOT}/

RUN chmod +x ${LAMBDA_RUNTIME_DIR}/bootstrap && \
	chmod +x ${LAMBDA_TASK_ROOT}/function.sh && \
	chmod +x ${LAMBDA_TASK_ROOT}/warm-cache.sh

WORKDIR /var/task

CMD [ "function.handler" ]

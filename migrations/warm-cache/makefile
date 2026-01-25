RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/ecr-lambda.mk

warm-cache:
	@$(MAKE) get-secrets ENV=$(ENV)
	@if [ "$(ENV)" != "local" ]; then \
		export AWS_LAMBDA_FUNCTION_NAME=cli-warm-cache; \
	fi; \
	set -a && source $(ENV_FILE) && set +a && \
	bash warm-cache.sh

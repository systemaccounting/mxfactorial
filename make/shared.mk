SHELL:=/bin/bash
APP_NAME=$(shell basename $(CURDIR))
PROJECT_CONF_FILE_NAME=project.yaml
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
ROOT_PATH=$(shell cd $(RELATIVE_PROJECT_ROOT_PATH); pwd)
SUB_PATH=$(shell printf '%s' $(CURDIR) | awk -F'$(ROOT_PATH)' '{print substr($$NF, 2)}')
REGION=$(shell yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $(PROJECT_CONF))
LAMBDA_NAME=$(APP_NAME)-$(ENV)
ENV_FILE_NAME=$(shell yq '.env_var.set.ENV_FILE_NAME.default' $(PROJECT_CONF))
ENV_FILE=$(CURDIR)/$(ENV_FILE_NAME)
NOHUP_LOG=$(RELATIVE_PROJECT_ROOT_PATH)/$(shell yq '.env_var.set.NOHUP_LOG.default' $(PROJECT_CONF))
LOCAL_ADDRESS=$(shell yq '.env_var.set.LOCAL_ADDRESS.default' $(PROJECT_CONF))
HOST=http://$(LOCAL_ADDRESS)

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

clean-log:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-invoke-log.sh \
		--app-name $(APP_NAME)

env:
	@$(MAKE) get-secrets

get-secrets:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/create-env-file.sh \
		--app-name $(APP_NAME) \
		--env $(ENV)

clean-env:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-env.sh \
		--app-name $(APP_NAME)

invoke:
	@$(MAKE) invoke-local

invoke-lambda:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/invoke-function-url.sh \
		--app-name $(APP_NAME) \
		--payload $(TEST_EVENT) \
        --env $(ENV)

# https://stackoverflow.com/a/32768048
print-vars:
	$(foreach v, $(.VARIABLES), $(info $(v) = $($(v))))
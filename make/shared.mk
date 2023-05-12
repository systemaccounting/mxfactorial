APP_NAME=$(shell basename $(CURDIR))
PROJECT_CONF_FILE_NAME=project.yaml
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
ROOT_PATH=$(shell cd $(RELATIVE_PROJECT_ROOT_PATH); pwd)
SUB_PATH=$(shell printf '%s' $(CURDIR) | awk -F'$(ROOT_PATH)' '{print substr($$NF, 2)}')
REGION=$(shell yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $(PROJECT_CONF))
EXECUTABLE_NAME=$(shell yq '.services.env_var.set.BINARY_NAME.default' $(PROJECT_CONF))
ARTIFACT_NAME=$(APP_NAME)-src.zip
LAMBDA_NAME=$(APP_NAME)-$(ENV)
ENV_FILE_NAME=$(shell yq '.env_var.set.ENV_FILE_NAME.default' $(PROJECT_CONF))
ENV_FILE=$(CURDIR)/$(ENV_FILE_NAME)
NOHUP_LOG=$(RELATIVE_PROJECT_ROOT_PATH)/$(shell yq '.env_var.set.NOHUP_LOG.default' $(PROJECT_CONF))
LOCAL_ADDRESS=$(shell yq '.env_var.set.LOCAL_ADDRESS.default' $(PROJECT_CONF))
HOST=http://$(LOCAL_ADDRESS)

DOCKER_ENV_VARS=PGDATABASE=mxfactorial \
PGUSER=test \
PGPASSWORD=test \
PGHOST=localhost \
PGPORT=5432

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

test-acc-arg:
ifndef ACC
	$(error trailing ACC assignment missing, e.g. make createuser ACC=testuser)
endif

clean-artifact:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-artifact.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME)

clean-log:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-invoke-log.sh \
		--app-name $(APP_NAME)

clean:
	@$(MAKE) clean-build
	@$(MAKE) clean-artifact
	@$(MAKE) clean-log

build:
	@$(MAKE) clean
	@$(MAKE) install
	@$(MAKE) compile
	@$(MAKE) zip

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

put-object:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/put-object.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
        --env $(ENV)

update-function:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/update-function.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
        --env $(ENV)

initial-deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) build
	$(MAKE) put-object

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) build
	$(MAKE) put-object
	$(MAKE) update-function

deploy-only:
	@$(MAKE) -s test-env-arg
	$(MAKE) put-object
	$(MAKE) update-function

now:
	@$(MAKE) -s clean
	$(MAKE) compile
	$(MAKE) zip
	$(MAKE) deploy-only ENV=dev

invoke:
	@$(MAKE) invoke-url

invoke-url:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/invoke-function-url.sh \
		--app-name $(APP_NAME) \
		--payload $(TEST_EVENT) \
        --env $(ENV)
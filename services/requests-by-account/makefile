APP_NAME = requests-by-account
CMD_DIR = $(CURDIR)/cmd
ARTIFACT_NAME=$(APP_NAME)-src.zip
RELATIVE_PROJECT_ROOT_PATH=../..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
REGION=$(shell jq -r ".region" $(PROJECT_CONF))
EXECUTABLE_NAME=$(shell jq -r ".apps.\"$(APP_NAME)\".executable_name" $(PROJECT_CONF))
DOCKER_URL=$(shell jq -r ".env_var.REQUESTS_BY_ACCOUNT_URL.docker" $(PROJECT_CONF))

RETURN_RECORD_LIMIT=20
TEST_ACCOUNT=JacobWebb
TEST_AUTH_ACCOUNT=$(TEST_ACCOUNT)
TEST_EVENT='{"auth_account":"$(TEST_AUTH_ACCOUNT)","account_name":"$(TEST_ACCOUNT)"}'

DOCKER_ENV_VARS=PGDATABASE=mxfactorial \
PGUSER=test \
PGPASSWORD=test \
PGHOST=localhost \
PGPORT=5432

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

run:
	@$(DOCKER_ENV_VARS) \
		RETURN_RECORD_LIMIT=$(RETURN_RECORD_LIMIT) \
		TEST_EVENT=$(TEST_EVENT) \
		go run ./cmd/main.go

###################### dependencies ######################

install:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/download-go-mod.sh

###################### build ######################

build:
	@$(MAKE) -s clean
	$(MAKE) install
	$(MAKE) compile
	$(MAKE) zip

compile:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/compile-go-linux.sh \
		--app-name $(APP_NAME)

zip:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/zip-executable.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
		--executable-name $(EXECUTABLE_NAME)

###################### clean ######################

clean:
	$(MAKE) clean-binary
	$(MAKE) clean-artifact
	$(MAKE) clean-log

clean-binary:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-binary.sh \
		--app-name $(APP_NAME) \
		--binary-name $(EXECUTABLE_NAME)

clean-artifact:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-artifact.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME)

clean-log:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-invoke-log.sh \
		--app-name $(APP_NAME)

###################### secrets ######################

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

clean-env:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-env.sh \
		--app-name $(APP_NAME)

get-secrets:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/create-env.sh \
		--app-name $(APP_NAME) \
		--env $(ENV) \
		--region $(REGION)

###################### deploy ######################

put-object:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/put-object.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
        --env $(ENV) \
        --region $(REGION)

update-function:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/update-function.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
        --env $(ENV) \
        --region $(REGION)

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

###################### invoke ######################

invoke:
	@$(MAKE) invoke-url

invoke-url:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/invoke-function-url.sh \
		--app-name $(APP_NAME) \
		--payload $(TEST_EVENT) \
        --env $(ENV) \
        --region $(REGION)

invoke-docker:
	@curl -s -d $(TEST_EVENT) $(DOCKER_URL) | jq .

demo-docker:
	@printf "*** request to %s service at %s\n" $(APP_NAME) $(DOCKER_URL)
	@echo $(TEST_EVENT) | jq .
	@printf "*** response from %s service at %s\n" $(APP_NAME) $(DOCKER_URL)
	@$(MAKE) invoke-docker
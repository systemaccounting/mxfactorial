APP_NAME=notifications-clear
CMD_DIR=$(CURDIR)/cmd
ARTIFACT_NAME=$(APP_NAME)-src.zip
RELATIVE_PROJECT_ROOT_PATH=../..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
DIR_PATH=$(shell jq -r ".apps.\"$(APP_NAME)\".path" $(PROJECT_CONF))
REGION=$(shell jq -r ".region" $(PROJECT_CONF))
EXECUTABLE_NAME=$(shell jq -r ".apps.\"$(APP_NAME)\".executable_name" $(PROJECT_CONF))
ENV_FILE=$(CURDIR)/.env

DOCKER_ENV_VARS=PGDATABASE=mxfactorial \
PGUSER=test \
PGPASSWORD=test \
PGHOST=localhost \
PGPORT=5432

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

test-username-arg:
ifndef ACCT
		$(error trailing ACCT assignment missing, e.g. ACCT=SomeAccount)
endif

test-password-arg:
ifndef PASS
		$(error trailing PASS assignment missing, e.g. PASS=SomeSecret)
endif

test-ids-arg:
ifndef IDS
		$(error trailing IDS assignment missing, e.g. IDS=2,7,12)
endif

run:
	@$(DOCKER_ENV_VARS) go run ./cmd/main.go

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

save-id-token:
	@$(MAKE) -s test-username-arg
	@$(MAKE) -s test-password-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/save-id-token.sh \
		--dir-path $(DIR_PATH) \
		--username $(ACCT) \
		--password $(PASS) \
		--region $(REGION)


###################### notifications ######################

get:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/get-notifications.sh \
		--dir-path $(DIR_PATH)

clear:
	@$(MAKE) -s test-ids-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clear-notifications.sh \
		--dir-path $(DIR_PATH) \
		--ids '$(IDS)'

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
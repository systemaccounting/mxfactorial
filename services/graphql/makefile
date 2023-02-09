APP_NAME=graphql
ARTIFACT_NAME=$(APP_NAME)-src.zip
RELATIVE_PROJECT_ROOT_PATH=../..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
EXECUTABLE_NAME=$(shell jq -r ".apps.\"$(APP_NAME)\".executable_name" $(PROJECT_CONF))
REGION=$(shell jq -r ".region" $(PROJECT_CONF))
ENV_FILE=$(CURDIR)/.env

gen:
	go generate ./...

run:
	$(MAKE) -s test-env-file
	eval $$(cat .env) go run ./server.go

open:
	open http://localhost:8080/

openapi:
	$(MAKE) -s test-env-file
	eval $$(cat .env); open $$GRAPHQL_URI

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

###################### secrets ######################

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

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

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
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s clean
	$(MAKE) compile
	$(MAKE) zip
	$(MAKE) deploy-only
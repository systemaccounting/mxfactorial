APP_NAME=test
RELATIVE_PROJECT_ROOT_PATH=..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
ENV_FILE=$(CURDIR)/.env
REGION=$(shell jq -r ".region" $(PROJECT_CONF))

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### test ######################

.PHONY: test
test:
	$(MAKE) test-compose-up

test-compose-up:
	@echo "\n\033[0;33mfirst docker compose requires several minutes to build before testing...\033[0m"
	if ! [ -d node_modules ]; then npm install; fi; npm run test:up

test-docker:
	if ! [ -d node_modules ]; then npm install; fi; npm run test:docker

test-cloud:
	@$(MAKE) -s test-env-arg
	@$(MAKE) get-secrets
	@echo "cloud integration test run time: <20 min"
	if ! [ -d node_modules ]; then npm install; fi; npm run test:cloud

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
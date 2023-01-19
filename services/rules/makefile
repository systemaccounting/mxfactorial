APP_NAME=rules
APP_DIR_NAME=$(APP_NAME)
ARTIFACT_NAME=$(APP_NAME)-src.zip
RELATIVE_PROJECT_ROOT_PATH=../..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
REGION=$(shell jq -r ".region" $(PROJECT_CONF))
BUILD_DIR=$(CURDIR)/dist
COMPILE_SRC_DIR=$(BUILD_DIR)/$(APP_DIR_NAME)/src
DEPS_DIR=$(CURDIR)/node_modules
ENV_FILE=$(CURDIR)/.env
ENTRYPOINT=$(COMPILE_SRC_DIR)/server.js
DOCKER_URL=$(shell jq -r ".env_var.RULES_URL.docker" $(PROJECT_CONF))

TEST_DATA_FILE=preRuleTrItems.json
TEST_DATA_DIR=../gopkg/testdata
TEST_EVENT='$(shell cat $(TEST_DATA_DIR)/$(TEST_DATA_FILE))'

DOCKER_ENV_VARS=PGDATABASE=mxfactorial \
PGUSER=test \
PGPASSWORD=test \
PGHOST=localhost \
PGPORT=5432 \
PG_MAX_CONNECTIONS=20 \
PG_IDLE_TIMEOUT=10000 \
PG_CONN_TIMEOUT=500 \
READINESS_CHECK_PATH=/healthz

run:
	@$(MAKE) clean-build
	@$(MAKE) compile
	@echo ""
	@$(DOCKER_ENV_VARS) node \
		--experimental-json-modules \
		--enable-source-maps \
		--es-module-specifier-resolution=node \
		--no-warnings \
		$(ENTRYPOINT)

nodemon:
	@$(DOCKER_ENV_VARS) npm run nodemon

tsnode:
	@$(DOCKER_ENV_VARS) npm run ts-node

water:
	@REQ=$$(jq -c . ../gopkg/testdata/bottledWater.json); curl -d "$$REQ" -H 'Content-Type: application/json' http://0.0.0.0:8081

watch:
	npx tsc -w

compile:
	npm run build

install:
	npm install

install-prod:
	npm install --only=prod

###################### test ######################

test:
	@$(MAKE) -s test-env-arg
	@$(MAKE) clean-build
	@$(MAKE) clean-artifact
	@$(MAKE) install
	@$(MAKE) compile
	@$(MAKE) test-unit
	@$(MAKE) deploy
	@$(MAKE) get-secrets
	@$(MAKE) test-cloud

test-unit:
	$(DOCKER_ENV_VARS) npm run test

test-local:
	$(MAKE) test-docker-availability
	NUM=$$(psql 'postgresql://test:test@0.0.0.0/mxfactorial' -t -c '\dt' | wc -l | tr -d ' '); \
	if [ "$$NUM" -eq 0 ]; then $(MAKE) -C '../../migrations' updocker DB=test; fi
	($(MAKE) run)

test-docker:
	if ! [ -d node_modules ]; then npm install; fi
	$(MAKE) test-docker-availability
	npm run test:integ:docker

test-cloud:
	@$(MAKE) -s test-env-arg
	npm run test:integ:cloud

test-single:
	$(DOCKER_ENV_VARS) npm run test:single

###################### build ######################

zip:
	$(MAKE) clean-build
	$(MAKE) clean-artifact
	$(MAKE) install
	$(MAKE) compile
	$(MAKE) clean-deps
	$(MAKE) install-prod
	$(MAKE) zip-only
	$(MAKE) install

zip-only:
	$(MAKE) clean-artifact
	zip -r $(ARTIFACT_NAME) node_modules package.json run-lambda.sh
	zip -uj $(ARTIFACT_NAME) $(COMPILE_SRC_DIR)/* -x "*.test.*" "*invoke.js*"
	(cd $(COMPILE_SRC_DIR); zip -ur ../../../$(ARTIFACT_NAME) ./* -x "tests/*" -x "*.test.*" -x "*invoke.js*")


###################### clean ######################

clean:
	$(MAKE) clean-deps
	$(MAKE) clean-build
	$(MAKE) clean-artifact
	$(MAKE) clean-env
	$(MAKE) clean-log

clean-deps:
	rm -rf $(DEPS_DIR)

clean-build:
	rm -rf $(BUILD_DIR)

clean-artifact:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-artifact.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME)

clean-env:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-env.sh \
		--app-name $(APP_NAME)

clean-log:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-invoke-log.sh \
		--app-name $(APP_NAME)

###################### deploy ######################

now:
	$(MAKE) deploy

initial-deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) zip
	$(MAKE) put-object

deploy-only:
	@$(MAKE) -s test-env-arg
	$(MAKE) put-object
	$(MAKE) update-function

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) zip
	$(MAKE) deploy-only

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

###################### invoke ######################

invoke:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/invoke-function.sh \
		--app-name $(APP_NAME) \
		--payload $(TEST_EVENT) \
        --env $(ENV) \
        --region $(REGION)

invoke-url:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/invoke-function-url.sh \
		--app-name $(APP_NAME) \
		--payload $(TEST_EVENT) \
        --env $(ENV) \
        --region $(REGION)

invoke-docker:
	@curl -s -H 'Content-Type: application/json' -d $(TEST_EVENT) $(DOCKER_URL) | jq .

demo-docker:
	@printf "*** request to %s service at %s\n" $(APP_NAME) $(DOCKER_URL)
	@jq . $(TEST_DATA_DIR)/$(TEST_DATA_FILE)
	@printf "*** response from service %s at %s\n" $(APP_NAME) $(DOCKER_URL)
	@$(MAKE) invoke-docker

###################### secrets ######################

get-secrets:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/create-env.sh \
		--app-name $(APP_NAME) \
		--env $(ENV) \
		--region $(REGION)

###################### init ######################

init:
	npx tsc --init

###################### make tests ######################

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

###################### docker ######################

test-docker-availability:
	@docker version > /dev/null 2>&1; if [ $$? -ne 0 ]; then echo "\033[1;31mdocker required. start docker \033[0m"; fi

print-docker-env-vars:
	@echo "$(DOCKER_ENV_VARS)"

docker-run:
	docker run --rm -p "0.0.0.0:8080:8080" -e "PGDATABASE=mxfactorial" -e "PGUSER=test" -e "PGPASSWORD=test" -e "PGHOST=172.17.0.2" -e "PGPORT=5432" -e "PG_MAX_CONNECTIONS=20" -e "PG_IDLE_TIMEOUT=10000" -e "PG_CONN_TIMEOUT=500" -e "READINESS_CHECK_PATH=/healthz" --name rules rules:v1
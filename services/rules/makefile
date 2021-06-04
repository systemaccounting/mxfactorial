APP_NAME=rules
APP_DIR_NAME=$(APP_NAME)
ARTIFACT_NAME=$(APP_NAME)-src.zip
LAMBDA_NAME=$(APP_NAME)-$(ENV)
ARTIFACT_BUCKET=mxfactorial-artifacts-$(ENV)
REGION=us-east-1
BUILD_DIR=$(CURDIR)/dist
COMPILE_SRC_DIR=$(BUILD_DIR)/$(APP_DIR_NAME)/src
DEPS_DIR=$(CURDIR)/node_modules
ENV_FILE=$(CURDIR)/.env
LAMBDA_INVOKE_LOG=$(CURDIR)/invoke.log
ENTRYPOINT=$(COMPILE_SRC_DIR)/invoke.js
DEPLOY_APP=true
TEST_DATA_FILE=preRuleTrItems.json
TEST_DATA_DIR=../gopkg/testdata
TEST_EVENT=$(TEST_DATA_DIR)/$(TEST_DATA_FILE)

DOCKER_ENV_VARS=PGDATABASE=mxfactorial \
PGUSER=test \
PGPASSWORD=test \
PGHOST=localhost \
PGPORT=5432 \
PG_CONN_TIMEOUT=100 \
PG_DISCONNECT=true

WORKFLOW_ENV_VARS := AWS_REGION \
SECRET \
PGDATABASE \
PGUSER \
PGPASSWORD \
PGHOST \
PGPORT \
CLIENT_ID \
POOL_ID \
GRAPHQL_API \
RULE_LAMBDA_ARN

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
	@$(MAKE) deploy ENV=$(ENV)
	@$(MAKE) test-integration

test-unit:
	$(DOCKER_ENV_VARS) npm run test

test-integration:
	@$(MAKE) -s test-env-arg
	npm run test:integration

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
	zip -r $(ARTIFACT_NAME) node_modules package.json
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
	rm -f $(ARTIFACT_NAME)

clean-env:
	rm -f $(ENV_FILE)

clean-log:
	rm -f $(LAMBDA_INVOKE_LOG)

###################### deploy ######################

now:
	$(MAKE) deploy ENV=dev

initial-deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) zip
	$(MAKE) put-object

deploy-only:
	@$(MAKE) -s test-env-arg
	$(MAKE) put-object ENV=$(ENV)
	$(MAKE) update-function ENV=$(ENV)

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) zip
	$(MAKE) deploy-only

put-object:
	@$(MAKE) -s test-env-arg
	$(MAKE) zip
	@ETAG=$$(aws s3api put-object \
		--bucket=$(ARTIFACT_BUCKET) \
		--key=$(ARTIFACT_NAME) \
		--body=$(CURDIR)/$(ARTIFACT_NAME) \
		--region=$(REGION) \
		--output=text | xargs); \
	echo "***Deployed $(ENV)/$(ARTIFACT_NAME) from s3 ETag: $$ETAG"

update-function:
	@$(MAKE) -s test-env-arg
	@MOD=$$(aws lambda update-function-code \
		--function-name=$(LAMBDA_NAME) \
		--s3-key=$(ARTIFACT_NAME) \
		--s3-bucket=$(ARTIFACT_BUCKET) \
		--region=$(REGION) \
		--query 'LastModified' | xargs);\
	echo "***$(LAMBDA_NAME) lambda deployed @ $$MOD"

###################### invoke ######################

invoke:
	@$(MAKE) -s test-env-arg
	@aws lambda invoke \
		--region $(REGION) \
		--invocation-type RequestResponse \
		--function-name $(LAMBDA_NAME) \
		--payload $$(cat $(TEST_EVENT) | base64) \
		$(LAMBDA_INVOKE_LOG)
	@cat $(LAMBDA_INVOKE_LOG)


###################### secrets ######################

get-secrets:
	@$(MAKE) -s retrieve-each-secret
	@if [ ! -s $(CURDIR)/.env ]; then \
		rm $(CURDIR)/.env; \
		echo 'no env vars required'; \
	else \
		echo 'env vars retrieved'; \
	fi

retrieve-each-secret: test-env-arg clean-env $(WORKFLOW_ENV_VARS)
$(WORKFLOW_ENV_VARS):
	@if [ $@ = AWS_REGION ]; then \
		echo AWS_REGION=$(REGION) >> $(CURDIR)/.env; \
	else \
		ENV_VAR=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
		echo $@=$$ENV_VAR >> $(CURDIR)/.env; \
	fi

###################### init ######################

init:
	npx tsc --init

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif
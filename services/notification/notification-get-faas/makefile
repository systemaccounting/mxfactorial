DIR := ${CURDIR}
APP_NAME = notification-get
APP_TYPE = faas
LAMBDA_NAME = notification-get
ARTIFACT_BUCKET= mxfactorial-websocket-artifacts
REGION = us-east-1
ENV_VARS := AWS_REGION NOTIFICATIONS_TABLE_NAME SECRET \
CLIENT_ID POOL_ID WSS_CONNECTION_URL WSS_CLIENT_URL \
PGDATABASE PGUSER PGPASSWORD PGHOST PGPORT

.PHONY: test-env-arg
test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

.PHONY: clean-deps
clean-deps:
		rm -rf node_modules

.PHONY: clean-env
clean-env:
		rm -f .env

.PHONY: clean-layer
clean-layer:
		rm -f $(APP_NAME)-layer.zip

.PHONY: clean-src
clean-src:
		rm -f $(APP_NAME)-src.zip

.PHONY: clean-artifact clean-layer clean-src
clean-artifact: clean-layer clean-src

.PHONY: clean clean-deps clean-env clean-artifact
clean: clean-deps clean-env clean-artifact

###################### dependencies ######################

.PHONY: install clean-deps
install: clean-deps
		yarn install

.PHONY: install-prod clean-deps
install-prod: clean-deps
		yarn install --prod

###################### secrets ######################

.PHONY: get-secrets retrieve-each-secret
get-secrets: retrieve-each-secret
	@if [ ! -s $(DIR)/.env ]; then \
		rm $(DIR)/.env; \
		echo 'no env vars required'; \
	else \
		echo 'env vars retrieved'; \
	fi

.PHONY: retrieve-each-secret test-env-arg clean-env $(ENV_VARS)
retrieve-each-secret: test-env-arg clean-env $(ENV_VARS)
$(ENV_VARS):
	@if [ $@ = AWS_REGION ]; then \
		echo AWS_REGION=$(REGION) >> $(DIR)/.env; \
	else \
		ENV_VAR=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
			echo $@=$$ENV_VAR \
			>> $(DIR)/.env; \
	fi

###################### build and test ######################

.PHONY: test test-unit test-integration
test: test-unit test-integration

.PHONY: test-unit test-env-arg get-secrets install
test-unit: test-env-arg get-secrets install
		yarn test

.PHONY: test-integration deploy
test-integration: deploy
		@yarn install; \
		yarn test:integration

.PHONY: dev test
dev: test # test target alias to create development environment

.PHONY: src test-env-arg clean-src test install-prod
src: test-env-arg clean-src test install-prod
		zip -r $(APP_NAME)-src.zip index.js package.json node_modules lib/* --exclude "*.test.*"

.PHONY: zip install-prod clean-src
zip: install-prod clean-src
		zip -r $(APP_NAME)-src.zip index.js package.json node_modules lib/* --exclude "*.test.*"

.PHONY: layer
layer:
		@echo "$(APP_NAME)-$(APP_TYPE) has few deps. not building layer"

###################### deploy ######################

.PHONY: deploy-layer layer
deploy-layer: layer
#		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-layer.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
#		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

.PHONY: deploy test-env-arg src
deploy: test-env-arg src # lambda layer NOT deployed
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

.PHONY: deploy-all test-env-arg deploy-layer initial-deploy
deploy-all: test-env-arg deploy-layer initial-deploy # layer and source

.PHONY: initial-deploy test-env-arg zip
initial-deploy: test-env-arg zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

###################### warm up ######################

.PHONY: warm-up
warm-up:
		@echo "warm up unnecessary. skipping"
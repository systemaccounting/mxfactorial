DIR := ${CURDIR}
APP_NAME = wss-notif-connect
APP_TYPE = faas
LAMBDA_NAME = websocket-notification-connect
ARTIFACT_BUCKET= mxfactorial-websocket-artifacts
REGION = us-east-1
ENV_VARS := AWS_REGION SECRET CLIENT_ID POOL_ID WSS_CLIENT_URL \
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

.PHONY: clean-artifact
clean-artifact:
		rm -f $(APP_NAME)-src.zip

.PHONY: clean clean-deps clean-env clean-artifact
clean: clean-deps clean-env clean-artifact

###################### dependencies ######################

.PHONY: install clean-deps
install: clean-deps
		yarn install
		cd src/utils/test-pem; yarn install

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

.PHONY: test test-env-arg install get-secrets test-unit test-integration
test: test-env-arg install get-secrets test-unit test-integration

.PHONY: test-unit test-env-arg get-secrets
test-unit: test-env-arg get-secrets
		yarn test

.PHONY: test-integration deploy get-secrets
test-integration: deploy get-secrets
		@yarn install; \
		yarn test:integration

.PHONY: dev test
dev: test # test target alias to create development environment

.PHONY: src test-env-arg clean test install-prod
src: test-env-arg clean test install-prod
		zip -r $(APP_NAME)-src.zip index.js package.json \
			lib/* --exclude "*.test.*"

.PHONY: zip install-prod clean-artifact
zip: install-prod clean-artifact
		zip -r $(APP_NAME)-src.zip index.js package.json \
			lib/* --exclude "*.test.*"

.PHONY: layer
layer:
		@echo "$(APP_NAME)-$(APP_TYPE) layer deployed separately:"
		@echo "https://github.com/mxfactorial/pg-sequelize-lambda-layer"

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

.PHONY: deploy test-env-arg zip
deploy: test-env-arg zip # lambda layer NOT deployed
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

.PHONY: deploy-all test-env-arg deploy-layer deploy
deploy-all: test-env-arg deploy-layer deploy # layer and source

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
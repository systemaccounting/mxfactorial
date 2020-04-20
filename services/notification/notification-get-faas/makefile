DIR := ${CURDIR}
APP_NAME = notification-get
APP_TYPE = faas
LAMBDA_NAME = notification-get
ARTIFACT_BUCKET= mxfactorial-websocket-artifacts
REGION = us-east-1
ENV_VARS := AWS_REGION NOTIFICATIONS_TABLE_NAME SECRET \
CLIENT_ID POOL_ID WSS_CONNECTION_URL WSS_CLIENT_URL \
PGDATABASE PGUSER PGPASSWORD PGHOST PGPORT NOTIFICATION_RETRIEVAL_LIMIT_COUNT

test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

clean-deps:
		rm -rf node_modules

clean-env:
		rm -f .env

clean-layer:
		rm -f $(APP_NAME)-layer.zip

clean-src:
		rm -f $(APP_NAME)-src.zip

clean-artifact: clean-layer clean-src

clean: clean-deps clean-env clean-artifact

###################### dependencies ######################

install: clean-deps
		yarn install

install-prod: clean-deps
		yarn install --prod

###################### secrets ######################

get-secrets: retrieve-each-secret
	@if [ ! -s $(DIR)/.env ]; then \
		rm $(DIR)/.env; \
		echo 'no env vars required'; \
	else \
		echo 'env vars retrieved'; \
	fi

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

test: test-unit test-integration

test-unit: test-env-arg get-secrets install
		yarn test

test-integration: deploy
		@yarn install; \
		yarn test:integration

dev: test # test target alias to create development environment

src: test-env-arg clean-src test install-prod
		zip -r $(APP_NAME)-src.zip index.js package.json node_modules lib/* --exclude "*.test.*"

zip: install-prod clean-src
		zip -r $(APP_NAME)-src.zip index.js package.json node_modules lib/* --exclude "*.test.*"

layer:
		@echo "$(APP_NAME)-$(APP_TYPE) has few deps. not building layer"

###################### deploy ######################

deploy-layer: layer
#		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-layer.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
#		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

deploy: src # lambda layer NOT deployed
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

deploy-all: test-env-arg deploy-layer initial-deploy # layer and source

initial-deploy: test-env-arg zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

###################### warm up ######################

warm-up:
		@echo "warm up unnecessary. skipping"
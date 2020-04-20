DIR := ${CURDIR}
APP_NAME = notification-send
APP_TYPE = faas
LAMBDA_NAME = notification-send
ARTIFACT_BUCKET= mxfactorial-websocket-artifacts
REGION = us-east-1
ENV_VARS := AWS_REGION WSS_CONNECTION_URL WSS_CLIENT_URL \
NOTIFICATIONS_TABLE_NAME SECRET CLIENT_ID POOL_ID NOTIFY_TOPIC_ARN \
PGDATABASE PGUSER PGPASSWORD PGHOST PGPORT

test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

clean-deps:
		rm -rf node_modules

clean-env:
		rm -f .env

clean-artifact:
		rm -f $(APP_NAME)-src.zip

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

test: test-env-arg install get-secrets test-unit test-integration

test-unit: test-env-arg get-secrets
		yarn test

test-integration: deploy get-secrets
		@yarn install; \
		yarn test:integration

src: test-env-arg clean test zip

zip: clean-artifact install-prod
		zip -r $(APP_NAME)-src.zip \
			index.js package.json node_modules lib supportedServices \
			--exclude "*.test.*"

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

deploy: test-env-arg zip # lambda layer NOT deployed
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

deploy-all: test-env-arg deploy-layer deploy # layer and source

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
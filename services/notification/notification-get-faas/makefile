DIR := ${CURDIR}
APP_NAME = notification-get
APP_TYPE = faas
LAMBDA_NAME = notification-get
ARTIFACT_BUCKET= mxfactorial-websocket-artifacts
REGION = us-east-1

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

.PHONY: install-prod clean-deps
install-prod: clean-deps
		yarn install --prod

###################### secrets ######################

.PHONY: get-secrets test-env-arg clean-env
get-secrets: test-env-arg clean-env
		@aws secretsmanager get-secret-value --secret-id $(ENV)/$(APP_NAME)-$(APP_TYPE) \
			--query 'SecretBinary' \
			--output text \
			| base64 --decode \
			> $(DIR)/.env
		@if [ ! -s $(DIR)/.env ]; then \
			rm $(DIR)/.env; \
		fi

.PHONY: create-secrets test-env-arg
create-secrets: test-env-arg
		aws secretsmanager create-secret \
			--name $(ENV)/$(APP_NAME)-$(APP_TYPE) \
			--description 'env-cmd file fetched before testing' \
			--secret-binary file://$(DIR)/.env

.PHONY: put-secrets test-env-arg
put-secrets: test-env-arg
		aws secretsmanager put-secret-value \
			--secret-id $(ENV)/$(APP_NAME)-$(APP_TYPE) \
			--secret-binary file://$(DIR)/.env

.PHONY: test-secret test-env-arg
test-secret: test-env-arg
		@aws secretsmanager describe-secret \
			--secret-id $(ENV)/$(APP_NAME)-$(APP_TYPE) \
			> /dev/null 2>&1; \
			if [ "$$?" != 0 ]; then \
				echo "$(APP_NAME)-$(APP_TYPE) requires a remote-stored .env file to build."; \
				printf "create an .env file and store with "; \
				echo "'make create-secrets' before building."; \
				echo "exiting."; \
				exit 1; \
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

.PHONY: src test-env-arg clean test install-prod
src: test-env-arg clean test install-prod
		zip -r $(APP_NAME)-src.zip index.js package.json lib/* --exclude "*.test.*"

.PHONY: zip install-prod
zip: install-prod
		zip -r $(APP_NAME)-src.zip index.js package.json lib/* --exclude "*.test.*"

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
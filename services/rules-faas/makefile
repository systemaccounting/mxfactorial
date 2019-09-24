DIR := ${CURDIR}
APP_NAME = rules
APP_TYPE = faas
LAMBDA_NAME = rules-lambda
ARTIFACT_BUCKET = mxfactorial-artifacts
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
		rm -f $(APP_NAME)-src.zip $(APP_NAME)-layer.zip

.PHONY: clean clean-deps clean-env clean-artifact
clean: clean-deps clean-env clean-artifact

###################### dependencies ######################

.PHONY: install
install:
		yarn install

.PHONY: install-prod
install-prod:
		yarn install --prod

###################### secrets ######################

.PHONY: get-secrets test-env-arg
get-secrets: test-env-arg
		@aws secretsmanager get-secret-value --secret-id $(ENV)/$(APP_NAME)-$(APP_TYPE) \
			--query 'SecretBinary' \
			--output text \
			| base64 --decode \
			> $(DIR)/.env
		@if [[ ! -s $(DIR)/.env ]]; then \
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
			if [[ "$$?" != 0 ]]; then \
				echo "$(APP_NAME)-$(APP_TYPE) requires a remote-stored .env file to build."; \
				printf "create an .env file and store with "; \
				echo "'make create-secrets' before building."; \
				echo "exiting."; \
				exit 1; \
			fi

###################### build and test ######################

.PHONY: zip
zip:
		zip -r $(APP_NAME)-src.zip index.js package.json src/* --exclude "*.test.*"

.PHONY: layer
layer:
		rm -f $(APP_NAME)-layer.zip
		yarn install --prod
		mkdir nodejs
		cp -r node_modules nodejs/node_modules
		zip -r $(APP_NAME)-layer.zip nodejs
		rm -rf nodejs

.PHONY: test test-env-arg clean install
test: test-env-arg clean install
		yarn test --silent

# aliases test target which creates tested artifact
.PHONY: src test
src: test

 # aliases test target to create development environment
.PHONY: dev test
dev: test

###################### deploy ######################

.PHONY: deploy test zip
deploy: test zip # lambda layer NOT deployed. use deploy-all
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

.PHONY: deploy-untested test-env-arg clean install zip
deploy-untested: test-env-arg clean install zip # lambda layer NOT deployed. use deploy-all
ifeq ($(ENV), prod)
		$(error no untested deployments to prod)
endif
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

.PHONY: deploy-layer test-env-arg layer
deploy-layer: test-env-arg layer
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-layer.zip \
			--body=$(DIR)/$(APP_NAME)-layer.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

.PHONY: deploy-all deploy-layer deploy
deploy-all: deploy-layer deploy # layer and source

.PHONY: initial-deploy test-env-arg clean deploy-layer zip
initial-deploy: test-env-arg clean deploy-layer zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

###################### warm up ######################

.PHONY: warm-up test-env-arg
warm-up: test-env-arg
		@aws lambda invoke \
			--region $(REGION) \
			--invocation-type RequestResponse \
			--function-name $(LAMBDA_NAME)-$(ENV) \
			--payload '{}' \
			invoke.log
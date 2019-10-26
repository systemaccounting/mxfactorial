DIR := ${CURDIR}
APP_NAME = transact
APP_TYPE = faas
LAMBDA_NAME = transact-lambda
RUNTIME = node
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1
ENV_VARS := AWS_REGION NOTIFY_TOPIC_ARN RULES_VPC_URL \
RULE_INSTANCE_TABLE_NAME

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
clean-artifact:
		rm -f $(APP_NAME)-layer.zip

.PHONY: clean-src
clean-src:
		rm -f $(APP_NAME)-src.zip

.PHONY: clean-artifact clean-layer clean-src
clean-artifact:  clean-layer clean-src

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

.PHONY: test test-env-arg test-unit
test: test-env-arg test-unit

.PHONY: test-unit test-env-arg install
test-unit: test-env-arg install
		yarn test

# todo: add integration tests
# .PHONY: test-integration deploy get-secrets
# test-integration: deploy get-secrets
# 		@yarn install; \
# 		yarn test:integration

# aliases test target which creates tested artifact
.PHONY: src test
src: test

 # aliases test target to create development environment
.PHONY: dev test
dev: test

.PHONY: zip clean-artifact
zip: clean-artifact
		zip -r $(APP_NAME)-src.zip index.js package.json src/* \
			--exclude "*.test.*"

.PHONY: layer install-prod
layer: install-prod
		mkdir nodejs
		cp -r node_modules nodejs/node_modules
		zip -r $(APP_NAME)-layer.zip nodejs
		rm -rf nodejs

###################### deploy ######################

.PHONY: deploy zip
deploy: zip # lambda layer NOT deployed. use deploy-all
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

.PHONY: initial-deploy test-env-arg publish-layer zip
initial-deploy: test-env-arg publish-layer zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

###################### create resource ######################

.PHONY: publish-layer test-env-arg deploy-layer
publish-layer: test-env-arg deploy-layer
		@LAYER_VERSION=$$(aws lambda publish-layer-version \
			--layer-name=$(APP_NAME)-$(RUNTIME)-deps-$(ENV) \
			--description="$(APP_NAME) dependencies in $(ENV)" \
			--content=S3Bucket=$(ARTIFACT_BUCKET)-$(ENV),S3Key=$(APP_NAME)-layer.zip \
			--region=$(REGION) \
			--query 'Version' \
			--output=text | sed 's/"//g'); \
		echo "***Published $(APP_NAME)-$(RUNTIME)-deps-$(ENV) layer as version $$LAYER_VERSION"

###################### warm up ######################

.PHONY: warm-up test-env-arg
warm-up: test-env-arg
		@aws lambda invoke \
			--region $(REGION) \
			--invocation-type RequestResponse \
			--function-name $(LAMBDA_NAME)-$(ENV) \
			--payload '{}' \
			invoke.log
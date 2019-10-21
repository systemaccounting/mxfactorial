DIR := ${CURDIR}
APP_NAME = rules
APP_TYPE = faas
LAMBDA_NAME = rules-lambda
RUNTIME = node
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

.PHONY: zip
zip:
		zip -r $(APP_NAME)-src.zip index.js package.json src/* node_modules \
			 --exclude "*.test.*"

.PHONY: layer
layer:
		@echo "$(APP_NAME)-$(APP_TYPE) has few deps. not building layer"

###################### deploy ######################

.PHONY: deploy test-env-arg install-prod zip
deploy: test-env-arg install-prod zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

.PHONY: deploy-untested test-env-arg install-prod zip
deploy-untested: test-env-arg install-prod zip
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
#		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-layer.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
#		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

.PHONY: deploy-all deploy
deploy-all: deploy # no layer currently

.PHONY: initial-deploy deploy
initial-deploy: deploy
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"


###################### create resource ######################

.PHONY: publish-layer deploy-layer
publish-layer: deploy-layer
#		@LAYER_VERSION=$$(aws lambda publish-layer-version \
			--layer-name=$(APP_NAME)-$(RUNTIME)-deps-$(ENV) \
			--description="$(APP_NAME) dependencies in $(ENV)" \
			--content=S3Bucket=$(ARTIFACT_BUCKET)-$(ENV),S3Key=$(APP_NAME)-layer.zip \
			--region=$(REGION) \
			--query 'Version' \
			--output=text | sed 's/"//g'); \
#		echo "***Published $(APP_NAME)-$(RUNTIME)-deps-$(ENV) layer as version $$LAYER_VERSION"

###################### warm up ######################

.PHONY: warm-up test-env-arg
warm-up: test-env-arg
		@aws lambda invoke \
			--region $(REGION) \
			--invocation-type RequestResponse \
			--function-name $(LAMBDA_NAME)-$(ENV) \
			--payload '{}' \
			invoke.log
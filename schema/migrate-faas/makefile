DIR := ${CURDIR}
APP_NAME = migrate
APP_TYPE = faas
LAMBDA_NAME = migrate-lambda
RUNTIME = node
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1
ENV_VARS := PGUSER PGHOST PGPASSWORD PGDATABASE PGPORT

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
		echo $@=$$ENV_VAR >> $(DIR)/.env; \
	fi

###################### build and test ######################

.PHONY: zip clean-src
zip: clean-src
		zip -r $(APP_NAME)-src.zip index.js package.json

.PHONY: layer
layer:
		rm -f $(APP_NAME)-layer.zip
		yarn install --prod
		mkdir nodejs
		cp -r node_modules nodejs/node_modules
		zip -r $(APP_NAME)-layer.zip nodejs
		rm -rf nodejs

# .PHONY: test test-env-arg clean install
# test: test-env-arg clean install
# 		yarn test --silent

# aliases zip target
.PHONY: src zip
src: zip

 # aliases test target to create development environment
# .PHONY: dev test
# dev: test


# todo: add unit and integration tests
# .PHONY: test test-unit test-integration
# test: test-unit test-integration

# .PHONY: test-unit test-env-arg get-secrets install
# test-unit: test-env-arg get-secrets install
# 		yarn test

# .PHONY: test-integration deploy
# test-integration: deploy
# 		@yarn install; \
# 		yarn test:integration

###################### deploy ######################

.PHONY: deploy test-env-arg zip deploy-only
deploy: test-env-arg zip deploy-only # lambda layer NOT deployed. use deploy-all

.PHONY: deploy-only test-env-arg
deploy-only: test-env-arg
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-layer.zip from s3 ETag: $$ETAG"

.PHONY: deploy-layer test-env-arg clean-deps layer
deploy-layer: test-env-arg clean-deps layer
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-layer.zip \
			--body=$(DIR)/$(APP_NAME)-layer.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-layer.zip from s3 ETag: $$ETAG"

.PHONY: deploy-all deploy-layer deploy
deploy-all: deploy-layer deploy # layer and source

.PHONY: initial-deploy test-env-arg clean publish-layer zip
initial-deploy: test-env-arg clean publish-layer zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-layer.zip from s3 ETag: $$ETAG"

###################### create resource ######################

.PHONY: publish-layer deploy-layer
publish-layer: deploy-layer
		@LAYER_VERSION=$$(aws lambda publish-layer-version \
			--layer-name=$(APP_NAME)-$(RUNTIME)-deps-$(ENV) \
			--description="$(APP_NAME) dependencies in $(ENV)" \
			--content=S3Bucket=$(ARTIFACT_BUCKET)-$(ENV),S3Key=$(APP_NAME)-layer.zip \
			--region=$(REGION) \
			--query 'Version' \
			--output=text | sed 's/"//g'); \
		echo "***Published $(APP_NAME)-$(RUNTIME)-deps-$(ENV) layer as version $$LAYER_VERSION"

###################### warm up ######################

# .PHONY: warm-up test-env-arg
# warm-up: test-env-arg
# 		@aws lambda invoke \
# 			--region $(REGION) \
# 			--invocation-type RequestResponse \
# 			--function-name $(LAMBDA_NAME)-$(ENV) \
# 			--payload '{}' \
# 			invoke.log
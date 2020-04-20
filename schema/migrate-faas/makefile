DIR := ${CURDIR}
APP_NAME = migrate
APP_TYPE = faas
LAMBDA_NAME = migrate-lambda
RUNTIME = node
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1
ENV_VARS := PGUSER PGHOST PGPASSWORD PGDATABASE PGPORT

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
		echo $@=$$ENV_VAR >> $(DIR)/.env; \
	fi

###################### build and test ######################

zip: clean-src
		zip -r $(APP_NAME)-src.zip index.js package.json

layer: install-prod clean-layer
		mkdir nodejs
		cp -r node_modules nodejs/node_modules
		zip -r $(APP_NAME)-layer.zip nodejs
		rm -rf nodejs

# # test: test-env-arg clean install
# 		yarn test --silent

# aliases zip target
src: zip

 # aliases test target to create development environment
# # dev: test


# todo: add unit and integration tests
# # test: test-unit test-integration

# # test-unit: test-env-arg get-secrets install
# 		yarn test

# # test-integration: deploy
# 		@yarn install; \
# 		yarn test:integration

###################### deploy ######################

deploy: test-env-arg zip deploy-only # lambda layer NOT deployed. use deploy-all

deploy-only: test-env-arg
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-layer.zip from s3 ETag: $$ETAG"

deploy-layer: test-env-arg layer
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-layer.zip \
			--body=$(DIR)/$(APP_NAME)-layer.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-layer.zip from s3 ETag: $$ETAG"

deploy-all: deploy-layer deploy # layer and source

initial-deploy: test-env-arg publish-layer zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-layer.zip from s3 ETag: $$ETAG"

###################### create resource ######################

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

# # warm-up: test-env-arg
# 		@aws lambda invoke \
# 			--region $(REGION) \
# 			--invocation-type RequestResponse \
# 			--function-name $(LAMBDA_NAME)-$(ENV) \
# 			--payload '{}' \
# 			invoke.log
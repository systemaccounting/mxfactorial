DIR := ${CURDIR}
APP_NAME = rules
APP_TYPE = faas
LAMBDA_NAME = rules-faas
RUNTIME = node
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1
ENV_VARS := AWS_REGION RULE_INSTANCE_TABLE_NAME SECRET \
CLIENT_ID POOL_ID GRAPHQL_API NINE_PERCENT_CA_SALES_TAX

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
		echo $@=$$ENV_VAR >> $(DIR)/.env; \
	fi

###################### build and test ######################

test: test-env-arg test-unit

test-unit: test-env-arg get-secrets install
		yarn test

test-integration: get-secrets deploy
		@yarn install; \
		yarn test:integration

# aliases test target which creates tested artifact
src: test

 # aliases test target to create development environment
dev: test

zip: clean-artifact
		zip -r $(APP_NAME)-src.zip index.js package.json src/* \
			 --exclude "*.test.*"

layer:
		@echo "$(APP_NAME)-$(APP_TYPE) has few deps. not building layer"

###################### deploy ######################

deploy: test-env-arg install-prod zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

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

deploy-layer: test-env-arg layer
#		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-layer.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
#		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

deploy-all: deploy # no layer currently

initial-deploy: test-env-arg zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"


###################### create resource ######################

publish-layer: deploy-layer
#		@LAYER_VERSION=$$(aws lambda publish-layer-version \
			--layer-name=$(APP_NAME)-$(RUNTIME)-deps-$(ENV) \
			--description="$(APP_NAME) dependencies in $(ENV)" \
			--content=S3Bucket=$(ARTIFACT_BUCKET)-$(ENV),S3Key=$(APP_NAME)-layer.zip \
			--region=$(REGION) \
			--query 'Version' \
			--output=text | sed 's/"//g'); \
#		echo "***Published $(APP_NAME)-$(RUNTIME)-deps-$(ENV) layer as version $$LAYER_VERSION"

# deprecated. rule init'd from terraform:
# infrastructure/terraform/aws/modules/environment/dynamodb.tf
# # init-rules: get-secrets
# 		@yarn install && yarn init:rules

###################### warm up ######################

warm-up: test-env-arg
		@aws lambda invoke \
			--region $(REGION) \
			--invocation-type RequestResponse \
			--function-name $(LAMBDA_NAME)-$(ENV) \
			--payload '{}' \
			invoke.log
DIR := ${CURDIR}
APP_NAME = request-approve
RUNTIME = node
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1
ENV_VARS := AWS_REGION NOTIFY_TOPIC_ARN RULE_INSTANCE_TABLE_NAME \
PGDATABASE PGUSER PGPASSWORD PGHOST PGPORT \
REQUEST_CREATE_LAMBDA_ARN REQUEST_APPROVE_LAMBDA_ARN \
NOTIFICATIONS_TABLE_NAME

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
		rm -f $(APP_NAME)-layer.zip

clean-src:
		rm -f $(APP_NAME)-src.zip

clean-artifact: clean-src

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

test: test-env-arg test-unit

test-unit: test-env-arg install
		yarn test

test-integration: deploy get-secrets
		@yarn install; \
		yarn test:integration

# aliases test target which creates tested artifact
src: test

 # aliases test target to create development environment
dev: test

zip: clean-artifact
		zip -r $(APP_NAME)-src.zip index.js package.json src/* \
			--exclude "*.test.*"

layer: install-prod
		mkdir nodejs
		cp -r node_modules nodejs/node_modules
		zip -r $(APP_NAME)-layer.zip nodejs
		rm -rf nodejs

###################### deploy ######################

deploy: zip # lambda layer NOT deployed. use deploy-all
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

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

deploy-layer: test-env-arg layer
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-layer.zip \
			--body=$(DIR)/$(APP_NAME)-layer.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

deploy-all: deploy-layer deploy # layer and source

initial-deploy: test-env-arg publish-layer zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

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

warm-up: test-env-arg
		@aws lambda invoke \
			--region $(REGION) \
			--invocation-type RequestResponse \
			--function-name $(APP_NAME)-$(ENV) \
			--payload '{}' \
			invoke.log
DIR := ${CURDIR}
APP_NAME = rules
APP_TYPE = faas
ARTIFACT_NAME = $(APP_NAME)-src.zip
LAMBDA_NAME = rules-faas
LAMBDA_INVOKE_LOG = invoke.log
RUNTIME = node
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1

DOCKER_ENV_VARS=PGDATABASE=mxfactorial \
PGUSER=test \
PGPASSWORD=test \
PGHOST=localhost \
PGPORT=5432 \
PG_MAX_CONNECTIONS=20 \
PG_IDLE_TIMEOUT=100 \
PG_CONN_TIMEOUT=100 \

WORKFLOW_ENV_VARS := AWS_REGION \
SECRET \
PGDATABASE \
PGUSER \
PGPASSWORD \
PGHOST \
PGPORT \
CLIENT_ID \
POOL_ID \
GRAPHQL_API \
RULE_LAMBDA_ARN

# TEST_EVENT created with:
# console.log(JSON.stringify(JSON.stringify(
#	createItemRequestData('JohnSmith','GroceryCo','creditor')
# )));
TEST_EVENT=[{\"id\":0,\"transaction_id\":123,\"item_id\":\"milk\",\"price\":2,\"quantity\":1,\"debitor_first\":null,\"rule_instance_id\":\"\",\"unit_of_measurement\":\"\",\"units_measurement\":\"\",\"debitor\":\"JohnSmith\",\"creditor\":\"GroceryCo\",\"debitor_profile_id\":0,\"creditor_profile_id\":0,\"debitor_approval_time\":\"\",\"creditor_approval_time\":\"\",\"debitor_expiration_time\":\"\",\"creditor_expiration_time\":\"\",\"debitor_rejection_time\":\"\",\"creditor_rejection_time\":\"\"},{\"id\":1,\"transaction_id\":123,\"item_id\":\"bread\",\"price\":3,\"quantity\":2,\"debitor_first\":null,\"rule_instance_id\":\"\",\"unit_of_measurement\":\"\",\"units_measurement\":\"\",\"debitor\":\"JohnSmith\",\"creditor\":\"GroceryCo\",\"debitor_profile_id\":0,\"creditor_profile_id\":0,\"debitor_approval_time\":\"\",\"creditor_approval_time\":\"\",\"debitor_expiration_time\":\"\",\"creditor_expiration_time\":\"\",\"debitor_rejection_time\":\"\",\"creditor_rejection_time\":\"\"}]

test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### run ######################

run-local:
	@$(DOCKER_ENV_VARS) node -e "require(\"./index\").handler($(TEST_EVENT)).then(x => console.log(x))"

run-local-noprint:
	@$(DOCKER_ENV_VARS) node -e "require(\"./index\").handler($(TEST_EVENT))"

###################### clean ######################

clean-deps:
	rm -rf node_modules

clean-env:
	rm -f .env

clean-artifact:
	rm -f $(ARTIFACT_NAME)

clean-layer:
	rm -f $(APP_NAME)-layer.zip

clean-log:
	rm -f $(LAMBDA_INVOKE_LOG)

clean:
	$(MAKE) clean-deps
	$(MAKE) clean-env
	$(MAKE) clean-artifact
	$(MAKE) clean-log

###################### dependencies ######################

install:
	$(MAKE) clean-deps
	yarn install

install-prod:
	$(MAKE) clean-deps
	yarn install --prod

###################### secrets ######################

get-secrets:
	@$(MAKE) -s retrieve-each-secret
	@if [ ! -s $(DIR)/.env ]; then \
		rm $(DIR)/.env; \
		echo 'no env vars required'; \
	else \
		echo 'env vars retrieved'; \
	fi

retrieve-each-secret: test-env-arg clean-env $(WORKFLOW_ENV_VARS)
$(WORKFLOW_ENV_VARS):
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

test:
	@$(MAKE) -s test-env-arg
	$(MAKE) install
	$(MAKE) test-unit
	$(MAKE) deploy ENV=$(ENV)
	$(MAKE) get-secrets ENV=$(ENV)
	$(MAKE) test-integration ENV=$(ENV)

test-unit:
	$(DOCKER_ENV_VARS) yarn test

t:
	$(DOCKER_ENV_VARS) yarn test:integration

test-integration:
	@yarn install; \
	yarn test:integration

# aliases test target which creates tested artifact
src: test

 # aliases test target to create development environment
dev: test

zip:
	$(MAKE) install-prod
	$(MAKE) zip-only

zip-only:
	zip -r $(ARTIFACT_NAME) \
		node_modules \
		package.json \
		src/* \
		index.js \
		--exclude "*.test.*"

layer:
	@echo "$(APP_NAME)-$(APP_TYPE) has few deps. not building layer"

###################### deploy ######################

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) zip
	$(MAKE) put-object
	$(MAKE) update-function

put-object:
	@$(MAKE) -s test-env-arg
	$(MAKE) zip
	@ETAG=$$(aws s3api put-object \
		--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
		--key=$(ARTIFACT_NAME) \
		--body=$(DIR)/$(ARTIFACT_NAME) \
		--region=$(REGION) \
		--output=text | xargs); \
	echo "***Deployed $(ENV)/$(ARTIFACT_NAME) from s3 ETag: $$ETAG"

update-function:
	@$(MAKE) -s test-env-arg
	@MOD=$$(aws lambda update-function-code \
		--function-name=$(LAMBDA_NAME)-$(ENV) \
		--s3-key=$(ARTIFACT_NAME) \
		--s3-bucket=$(ARTIFACT_BUCKET)-$(ENV) \
		--region=$(REGION) \
		--query 'LastModified' | xargs);\
	echo "***$(LAMBDA_NAME)-$(ENV) lambda deployed @ $$MOD"

deploy-untested:
	@$(MAKE) -s test-env-arg
	$(MAKE) zip
ifeq ($(ENV), prod)
		$(error no untested deployments to prod)
endif
	@ETAG=$$(aws s3api put-object \
		--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
		--key=$(ARTIFACT_NAME) \
		--body=$(DIR)/$(ARTIFACT_NAME) \
		--region=$(REGION) \
		--output=text | xargs); \
	echo "***Deployed $(ENV)/$(ARTIFACT_NAME) from s3 ETag: $$ETAG"

deploy-layer: test-env-arg layer
#		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-layer.zip \
			--body=$(DIR)/$(ARTIFACT_NAME) \
			--region=$(REGION) \
			--output=text | xargs); \
#		echo "***Deployed $(ENV)/$(ARTIFACT_NAME) from s3 ETag: $$ETAG"

deploy-all: deploy # no layer currently

initial-deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) zip
	$(MAKE) put-object


###################### create resource ######################

publish-layer: deploy-layer
#	@LAYER_VERSION=$$(aws lambda publish-layer-version \
		--layer-name=$(APP_NAME)-$(RUNTIME)-deps-$(ENV) \
		--description="$(APP_NAME) dependencies in $(ENV)" \
		--content=S3Bucket=$(ARTIFACT_BUCKET)-$(ENV),S3Key=$(APP_NAME)-layer.zip \
		--region=$(REGION) \
		--query 'Version' \
		--output=text | xargs); \
#	echo "***Published $(APP_NAME)-$(RUNTIME)-deps-$(ENV) layer as version $$LAYER_VERSION"

###################### warm up ######################

warm-up:
	@$(MAKE) -s test-env-arg
	@aws lambda invoke \
		--region $(REGION) \
		--invocation-type RequestResponse \
		--function-name $(LAMBDA_NAME)-$(ENV) \
		--payload '{}' \
		$(LAMBDA_INVOKE_LOG)

invoke:
	@$(MAKE) -s test-env-arg
	@ENCODED_JSON=$$(echo "$(TEST_EVENT)" | base64); \
	aws lambda invoke \
		--region $(REGION) \
		--invocation-type RequestResponse \
		--function-name $(LAMBDA_NAME)-$(ENV) \
		--payload $$ENCODED_JSON \
		$(LAMBDA_INVOKE_LOG)
	@cat $(LAMBDA_INVOKE_LOG)
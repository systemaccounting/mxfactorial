DIR := ${CURDIR}
APP_NAME = deploy-lambda
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1

.PHONY: test-env-arg
test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

.PHONY: clean
clean:
		rm -f $(APP_NAME)-src.zip

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

###################### build & test ######################

.PHONY: zip clean
zip: clean
		zip -r $(APP_NAME)-src.zip index.js

# aliases zip target
.PHONY: src zip
src: zip

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

.PHONY: deploy zip deploy-only
deploy: zip deploy-only

.PHONY: deploy-only test-env-arg
deploy-only: test-env-arg
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed from s3 ETag: $$ETAG"

.PHONY: deploy-all deploy
deploy-all: deploy

.PHONY: initial-deploy test-env-arg clean zip
initial-deploy: test-env-arg clean zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"
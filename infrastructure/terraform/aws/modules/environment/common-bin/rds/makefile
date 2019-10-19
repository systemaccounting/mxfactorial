DIR := ${CURDIR}
APP_NAME = teardown
APP_TYPE = faas
ARTIFACT_BUCKET= mxfactorial-artifacts
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

.PHONY: clean-artifact
clean-artifact:
		rm -f $(APP_NAME)-src.zip

.PHONY: clean clean-deps clean-artifact
clean: clean-deps clean-artifact

###################### dependencies ######################

.PHONY: install clean-deps
install: clean-deps
		yarn install

###################### build ######################

.PHONY: zip
zip:
		zip -r $(APP_NAME)-src.zip index.js package.json node_modules

.PHONY: src zip
src: zip

.PHONY: dev test
dev: test # test target alias to create development environment

.PHONY: layer
layer:
		@echo "$(APP_NAME)-$(APP_TYPE) has few deps. not building layer"

###################### deploy ######################

.PHONY: deploy install zip deploy-only
deploy: install zip deploy-only

.PHONY: deploy-only test-env-arg
deploy-only: test-env-arg
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

.PHONY: deploy-layer layer
deploy-layer: layer
#		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-layer.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
#		echo "***Deployed from s3 ETag: $$ETAG"

.PHONY: deploy-all test-env-arg deploy
deploy-all: test-env-arg deploy # layer and source

.PHONY: initial-deploy test-env-arg zip
initial-deploy: test-env-arg clean zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"
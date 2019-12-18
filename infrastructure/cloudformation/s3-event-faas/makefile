DIR := ${CURDIR}
APP_NAME = s3-event
APP_TYPE = faas
ARTIFACT_BUCKET = mxfactorial-websocket-artifacts
REGION = us-east-1

.PHONY: test-env-arg
test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

.PHONY: clean-deps
clean-deps:
		rm -rf bin include lib

.PHONY: clean-artifact
clean-artifact:
		rm -f $(APP_NAME)-src.zip

.PHONY: clean clean-deps clean-artifact
clean: clean-deps clean-artifact

###################### dependencies ######################

.PHONY: install-env clean-deps
install-env: clean-deps
		@python3 -m venv .; \
		. ./bin/activate; \
		pip install pipenv

.PHONY: install-deps
install-deps:
		. ./bin/activate; pipenv install --dev

.PHONY: install install-env install-deps
install: install-env install-deps

###################### build and test ######################

.PHONY: test install test-unit
test: install test-unit

.PHONY: test-unit
test-unit:
		. ./bin/activate; \
		AWS_REGION=neverland ENVIRONMENT=dev ARTIFACTS_BUCKET=some-artifact-dev \
		pytest -vv src

# todo: add integration tests
# .PHONY: test-integration
# test-integration:

 # aliases test target to create development environment
.PHONY: dev test
dev: test

# deps added by lambda layer
.PHONY: zip clean-artifact
zip: clean-artifact
		zip -r -j $(APP_NAME)-src.zip src/main.py

# aliases test target which creates tested artifact 
.PHONY: src zip
src: zip

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

.PHONY: deploy-untested test-env-arg clean install
deploy-untested: test-env-arg clean install
ifeq ($(ENV), prod)
		$(error no untested deployments to prod)
endif
		zip -r -j $(APP_NAME)-src.zip src/main.py; \
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed from s3 ETag: $$ETAG"

.PHONY: deploy-all deploy
deploy-all: deploy # layer and source

.PHONY: initial-deploy test-env-arg install zip
initial-deploy: test-env-arg install zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"
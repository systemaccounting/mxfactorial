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
		@if [ ! -d ./bin ]; then \
			python3.7 -m venv .; \
		fi; \
		source ./bin/activate; \
		pip install pipenv

.PHONY: install install-env
install: install-env
		pipenv install --dev

###################### build and test ######################

.PHONY: test install
test: install
		source ./bin/activate; \
		AWS_REGION=neverland ENVIRONMENT=dev ARTIFACTS_BUCKET=some-artifact-dev \
		pytest -vv src

.PHONY: test-only
test-only:
		source ./bin/activate; \
		AWS_REGION=neverland ENVIRONMENT=dev ARTIFACTS_BUCKET=some-artifact-dev \
		pytest -vv src

 # aliases test target to create development environment
.PHONY: dev test
dev: test

# deps added by lambda layer
.PHONY: zip
zip:
		zip -r -j $(APP_NAME)-src.zip src/main.py

# aliases test target which creates tested artifact
.PHONY: src zip
src: zip

###################### deploy ######################

.PHONY: deploy test-env-arg zip
deploy: zip test-env-arg
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
initial-deploy: test-env-arg clean install zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"
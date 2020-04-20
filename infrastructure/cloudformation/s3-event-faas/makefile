DIR := ${CURDIR}
APP_NAME = s3-event
APP_TYPE = faas
ARTIFACT_BUCKET = mxfactorial-websocket-artifacts
REGION = us-east-1

test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

clean-deps:
		rm -rf bin include lib

clean-artifact:
		rm -f $(APP_NAME)-src.zip

clean: clean-deps clean-artifact

###################### dependencies ######################

install-env: clean-deps
		@python3 -m venv .; \
		. ./bin/activate; \
		pip install pipenv

install-deps:
		. ./bin/activate; pipenv install --dev

install: install-env install-deps

###################### build and test ######################

test: install test-unit

test-unit:
		. ./bin/activate; \
		AWS_REGION=neverland ENVIRONMENT=dev ARTIFACTS_BUCKET=some-artifact-dev \
		pytest -vv src

# todo: add integration tests
# # test-integration:

 # aliases test target to create development environment
dev: test

# deps added by lambda layer
zip: clean-artifact
		zip -r -j $(APP_NAME)-src.zip src/main.py

# aliases test target which creates tested artifact
src: zip

###################### deploy ######################

deploy: zip deploy-only

deploy-only: test-env-arg
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed from s3 ETag: $$ETAG"

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

deploy-all: deploy # layer and source

initial-deploy: test-env-arg install zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"
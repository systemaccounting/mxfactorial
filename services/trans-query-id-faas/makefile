DIR := ${CURDIR}
APP_NAME = trans-query-id
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1
BINARY_NAME = index.handler

.PHONY: test-env-arg
test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

clean-artifact:
		rm -f $(APP_NAME)-src.zip

clean-binary:
		rm -f $(BINARY_NAME)

clean-vendor:
		rm -rf vendor

clean: clean-binary clean-artifact clean-vendor

###################### dependencies ######################

install:
		go mod vendor

###################### build ######################

compile:
		GOOS=linux go build -o $(BINARY_NAME) main.go

zip:
		zip $(APP_NAME)-src.zip ./$(BINARY_NAME)

build: clean install compile zip

# aliases build target
dev: build

# aliases build target
src: build

###################### deploy ######################

deploy: test-env-arg build deploy-only

deploy-only: test-env-arg
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

deploy-all: deploy

# avoid aliasing deploy
initial-deploy: test-env-arg clean install compile zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

###################### warm up ######################

warm-up: test-env-arg
		@aws lambda invoke \
			--region $(REGION) \
			--invocation-type RequestResponse \
			--function-name $(APP_NAME)-$(ENV) \
			--payload '{}' \
			invoke.log

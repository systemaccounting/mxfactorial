DIR := ${CURDIR}
APP_NAME = measure
APP_TYPE = faas
LAMBDA_NAME = measure-lambda
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1
BINARY_NAME = index.handler

.PHONY: test-env-arg
test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

.PHONY: clean-artifact
clean-artifact:
		rm -f $(APP_NAME)-src.zip

.PHONY: clean-binary
clean-binary:
		rm -f $(BINARY_NAME)

.PHONY: clean clean-binary clean-artifact
clean: clean-binary clean-artifact

###################### dependencies ######################

.PHONY: install
install:
		go get -t

###################### build ######################

.PHONY: compile
compile:
		GOOS=linux go build -o $(BINARY_NAME) *.go

.PHONY: zip
zip:
		zip $(APP_NAME)-src.zip ./$(BINARY_NAME)

.PHONY: build clean install compile zip
build: clean install compile zip

# aliases build target
.PHONY: dev build
dev: build

# aliases build target
.PHONY: src build
src: build

###################### deploy ######################

.PHONY: deploy test-env-arg build deploy-only
deploy: test-env-arg build deploy-only

.PHONY: deploy-only test-env-arg
deploy-only: test-env-arg
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

.PHONY: deploy-all deploy
deploy-all: deploy

# avoid aliasing deploy
.PHONY: initial-deploy test-env-arg clean install compile zip
initial-deploy: test-env-arg clean install compile zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

###################### warm up ######################

.PHONY: warm-up test-env-arg
warm-up: test-env-arg
		@aws lambda invoke \
			--region $(REGION) \
			--invocation-type RequestResponse \
			--function-name $(LAMBDA_NAME)-$(ENV) \
			--payload '{}' \
			invoke.log
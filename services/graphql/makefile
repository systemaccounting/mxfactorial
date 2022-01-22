CMD_DIR=$(CURDIR)
APP_NAME=graphql
ARTIFACT_NAME=$(APP_NAME)-src.zip
PROJECT_CONF=../../project.json
BUCKET_PREFIX=$(shell jq -r '.artifacts_bucket_name_prefix' $(PROJECT_CONF))
ARTIFACT_BUCKET=$(BUCKET_PREFIX)-$(ENV)
REGION=us-east-1
BINARY_NAME = index.handler
LAMBDA_OS=linux
LAMBDA_NAME=$(APP_NAME)-$(ENV)
ENTRYPOINT=server.go
ENV_FILE=$(CURDIR)/.env

ENV_VARS := AWS_REGION \
GRAPHQL_URI \
RULE_LAMBDA_ARN \
LOCAL_ENV \
REQUEST_CREATE_LAMBDA_ARN \
REQUEST_APPROVE_LAMBDA_ARN \
REQUEST_BY_ID_LAMBDA_ARN \
REQUESTS_BY_ACCOUNT_LAMBDA_ARN \
TRANSACTIONS_BY_ACCOUNT_LAMBDA_ARN \
TRANSACTION_BY_ID_LAMBDA_ARN \
BALANCE_BY_ACCOUNT_LAMBDA_ARN

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

run:
	$(MAKE) gen
	$(MAKE) -s test-env-file
	eval $$(cat .env) go run ./server.go

run-reflex:
	$(MAKE) -s test-env-file
	eval $$(cat .env) go run ./server.go

reflex:
	$(MAKE) -s test-env-file
	$(MAKE) gen
	reflex --start-service -r '\.go$$' make run-reflex

gen:
	gqlgen generate

open:
	open http://localhost:8080/

openapi:
	$(MAKE) -s test-env-file
	eval $$(cat .env); open $$GRAPHQL_URI

skeleton:
	go run github.com/99designs/gqlgen init

install:
	go mod download

clean:
	$(MAKE) clean-binary
	$(MAKE) clean-artifact

clean-artifact:
	rm -f $(APP_NAME)-src.zip

clean-binary:
	rm -f $(BINARY_NAME)

clean-env:
	rm -f .env

compile:
	GOOS=$(LAMBDA_OS) go build -o $(BINARY_NAME) $(CMD_DIR)/$(ENTRYPOINT)

zip:
	zip $(APP_NAME)-src.zip ./$(BINARY_NAME)

build:
	$(MAKE) clean
	$(MAKE) install
	$(MAKE) compile
	$(MAKE) zip

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) build
	$(MAKE) put-object
	$(MAKE) update-function

deploy-only:
	$(MAKE) put-object ENV=$(ENV)
	$(MAKE) update-function ENV=$(ENV)

now:
	$(MAKE) clean
	$(MAKE) compile
	$(MAKE) zip
	$(MAKE) deploy-only ENV=dev

put-object:
	@$(MAKE) -s test-env-arg
	@ETAG=$$(aws s3api put-object \
		--bucket=$(ARTIFACT_BUCKET) \
		--key=$(ARTIFACT_NAME) \
		--body=$(CURDIR)/$(ARTIFACT_NAME) \
		--region=$(REGION) \
		--output=text | xargs); \
	echo "***pushed $(ARTIFACT_NAME) artifact with ETag: $$ETAG"

update-function:
	@$(MAKE) -s test-env-arg
	@MOD=$$(aws lambda update-function-code \
		--function-name=$(LAMBDA_NAME) \
		--s3-key=$(ARTIFACT_NAME) \
		--s3-bucket=$(ARTIFACT_BUCKET) \
		--region=$(REGION) \
		--query 'LastModified' | xargs);\
	echo "***$(LAMBDA_NAME) lambda deployed @ $$MOD"

initial-deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) clean
	$(MAKE) install
	$(MAKE) compile
	$(MAKE) zip
	$(MAKE) put-object ENV=$(ENV)

###################### secrets ######################

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

get-secrets:
	@$(MAKE) -s retrieve-each-secret
	@if [ ! -s $(ENV_FILE) ]; then \
		rm $(ENV_FILE); \
		echo 'no env vars required'; \
	else \
		echo 'env vars retrieved'; \
	fi

retrieve-each-secret: test-env-arg clean-env $(ENV_VARS)
$(ENV_VARS):
	@if [ $@ = AWS_REGION ]; then \
		echo AWS_REGION=$(REGION) >> $(ENV_FILE); \
	elif [ $@ = LOCAL_ENV ]; then \
		echo LOCAL_ENV=1 >> $(ENV_FILE); \
	else \
		ENV_VAR=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
		echo $@=$$ENV_VAR >> $(ENV_FILE); \
	fi

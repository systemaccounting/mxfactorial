APP_NAME=request-create
ARTIFACT_NAME=$(APP_NAME)-src.zip
PROJECT_CONF=../../project.json
BUCKET_PREFIX=$(shell jq -r '.artifacts_bucket_name_prefix' $(PROJECT_CONF))
ARTIFACT_BUCKET=$(BUCKET_PREFIX)-$(ENV)
CMD_DIR=$(CURDIR)/cmd
BINARY_NAME = index.handler
REGION=us-east-1
LAMBDA_OS=linux
LAMBDA_NAME=$(APP_NAME)-$(ENV)
LAMBDA_INVOKE_LOG=invoke.log
ENV_FILE=$(CURDIR)/.env
ENV_VARS := AWS_REGION \
RULE_LAMBDA_ARN \
NOTIFY_TOPIC_ARN

TEST_DATA_FILE=transNoAppr.json
TEST_DATA_DIR=../gopkg/testdata
TEST_EVENT=$(TEST_DATA_DIR)/$(TEST_DATA_FILE)

DOCKER_ENV_VARS=PGDATABASE=mxfactorial \
PGUSER=test \
PGPASSWORD=test \
PGHOST=localhost \
PGPORT=5432

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

run:
	@$(MAKE) -s test-env-file
	@$(DOCKER_ENV_VARS) \
		TEST_EVENT=$$(cat $(TEST_EVENT)) \
		eval $$(cat $(ENV_FILE)) \
		go run $(CMD_DIR)

###################### dependencies ######################

install:
	go mod download

###################### build ######################

clean:
	$(MAKE) clean-binary
	$(MAKE) clean-artifact

clean-binary:
	rm -f $(BINARY_NAME)

compile:
	GOOS=$(LAMBDA_OS) go build -o $(BINARY_NAME) $(CMD_DIR)

build:
	$(MAKE) clean
	$(MAKE) install
	$(MAKE) compile
	$(MAKE) zip

###################### secrets ######################

clean-env:
	rm -f $(ENV_FILE)

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
	else \
		ENV_VAR=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
		echo $@=$$ENV_VAR >> $(ENV_FILE); \
	fi


###################### deploy ######################

clean-artifact:
	rm -f $(APP_NAME)-src.zip

zip:
	zip $(APP_NAME)-src.zip ./$(BINARY_NAME)

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

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) build
	$(MAKE) put-object
	$(MAKE) update-function

deploy-only:
	@$(MAKE) -s test-env-arg
	$(MAKE) put-object ENV=$(ENV)
	$(MAKE) update-function ENV=$(ENV)

now:
	$(MAKE) clean
	$(MAKE) compile
	$(MAKE) zip
	$(MAKE) deploy-only ENV=dev

###################### deploy ######################

invoke:
	@$(MAKE) -s test-env-arg
	@aws lambda invoke \
		--region $(REGION) \
		--invocation-type RequestResponse \
		--function-name $(LAMBDA_NAME) \
		--payload $$(cat $(TEST_EVENT) | base64) \
		$(LAMBDA_INVOKE_LOG)
	@cat $(LAMBDA_INVOKE_LOG)
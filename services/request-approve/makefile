APP_NAME=request-approve
ARTIFACT_NAME=$(APP_NAME)-src.zip
ARTIFACT_BUCKET=mxfactorial-artifacts-$(ENV)
MOD_PATH=github.com/systemaccounting/mxfactorial/services/$(APP_NAME)
CMD_DIR=$(CURDIR)/cmd
REGION=us-east-1
BINARY_NAME=index.handler
LAMBDA_OS=linux
LAMBDA_NAME=$(APP_NAME)-$(ENV)
LAMBDA_INVOKE_LOG=invoke.log

TEST_ACCOUNT=JacobWebb
TEST_ROLE=debitor
TEST_AUTH_ACCOUNT=$(TEST_ACCOUNT)
TEST_ID=3
TEST_EVENT='{"auth_account":"$(TEST_AUTH_ACCOUNT)","id":$(TEST_ID),"account_name":"$(TEST_ACCOUNT)","account_role":"$(TEST_ROLE)"}'

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
	@$(DOCKER_ENV_VARS) \
		TEST_EVENT=$(TEST_EVENT) \
		go run $(CMD_DIR)

###################### dependencies ######################

install:
	go mod download

###################### build ######################

compile:
	GOOS=$(LAMBDA_OS) \
		go build -o $(BINARY_NAME) \
		$(CMD_DIR)/main.go

zip:
	zip $(APP_NAME)-src.zip ./$(BINARY_NAME)

build:
	$(MAKE) clean
	$(MAKE) install
	$(MAKE) compile
	$(MAKE) zip

###################### clean ######################

clean-artifact:
	rm -f $(APP_NAME)-src.zip

clean-binary:
	rm -f $(BINARY_NAME)

clean:
	$(MAKE) clean-binary
	$(MAKE) clean-artifact


###################### deploy ######################

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
CMD_DIR=$(CURDIR)/cmd
APP_NAME=balance-by-account
ARTIFACT_NAME=$(APP_NAME)-src.zip
PROJECT_CONF=../../project.json
BUCKET_PREFIX=$(shell jq -r '.artifacts_bucket_name_prefix' $(PROJECT_CONF))
ARTIFACT_BUCKET=$(BUCKET_PREFIX)-$(ENV)
REGION=us-east-1
BINARY_NAME=index.handler
LAMBDA_OS=linux
PGHOST_KEY=$(ENV)/PGHOST
PGUSER_KEY=$(ENV)/PGUSER
PGPASSWORD_KEY=$(ENV)/PGPASSWORD
PGDATABASE_KEY=$(ENV)/PGDATABASE
PGPORT=5432
TEST_ACCOUNT=JacobWebb
TEST_AUTH_ACCOUNT=$(TEST_ACCOUNT)
TEST_EVENT='{"auth_account":"$(TEST_AUTH_ACCOUNT)","account_name":"$(TEST_ACCOUNT)"}'
TEST_SENDER_ACCOUNT=$(TEST_ACCOUNT)
LAMBDA_NAME=$(APP_NAME)-$(ENV)

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
		go run ./cmd/main.go

###################### clean ######################

clean:
	$(MAKE) clean-binary
	$(MAKE) clean-artifact

clean-artifact:
		rm -f $(APP_NAME)-src.zip

clean-binary:
		rm -f $(BINARY_NAME)

###################### dependencies ######################

install:
	go mod download

###################### build ######################

compile:
	GOOS=$(LAMBDA_OS) go build -o $(BINARY_NAME) $(CMD_DIR)/main.go

zip:
	zip $(APP_NAME)-src.zip ./$(BINARY_NAME)

build:
	$(MAKE) clean
	$(MAKE) install
	$(MAKE) compile
	$(MAKE) zip

###################### test ######################

test:
	$(MAKE) test-unit
	$(MAKE) test-integration
	$(MAKE) test-cover

mock:
	mockgen -package=mock \
		-destination=./pkg/mock/rows.go \
		github.com/jackc/pgx/v4 \
		Rows
	mockgen -package=mock \
		-source=./sqldb.go \
		-destination=./pkg/mock/sqldb.go

test-cover:
	go test -cover ./...

test-unit:
	go test -v ./...

test-integration:
	@$(MAKE) -s test-env-arg
	@PGHOST=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(PGHOST_KEY) \
			--query 'SecretString' \
			--output text) \
		PGPORT=${PGPORT} \
		PGUSER=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(PGUSER_KEY) \
			--query 'SecretString' \
			--output text) \
		PGPASSWORD=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(PGPASSWORD_KEY) \
			--query 'SecretString' \
			--output text) \
		PGDATABASE=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(PGDATABASE_KEY) \
			--query 'SecretString' \
			--output text) \
		TEST_SENDER_ACCOUNT=$(TEST_SENDER_ACCOUNT) \
		AWS_REGION=$(REGION) \
		LAMBDA_NAME=$(LAMBDA_NAME) \
			go test -v --tags=integration ./cmd

test-local:
	@$(MAKE) -s test-env-arg
	@PGHOST=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(PGHOST_KEY) \
			--query 'SecretString' \
			--output text) \
		PGPORT=${PGPORT} \
		PGUSER=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(PGUSER_KEY) \
			--query 'SecretString' \
			--output text) \
		PGPASSWORD=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(PGPASSWORD_KEY) \
			--query 'SecretString' \
			--output text) \
		PGDATABASE=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(PGDATABASE_KEY) \
			--query 'SecretString' \
			--output text) \
		TEST_EVENT=$(TEST_EVENT) \
		go run $(CMD_DIR)/main.go

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

###################### warm up ######################

warm-up:
	@$(MAKE) -s test-env-arg
	@aws lambda invoke \
		--region $(REGION) \
		--invocation-type RequestResponse \
		--function-name $(LAMBDA_NAME) \
		--payload '{}' \
		invoke.log

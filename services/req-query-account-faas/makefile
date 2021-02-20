DIR := ${CURDIR}
CMD_DIR = $(DIR)/cmd
APP_NAME = req-query-account
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1
BINARY_NAME = index.handler
LAMBDA_OS=linux
PGHOST_KEY = $(ENV)/PGHOST
PGUSER_KEY = $(ENV)/PGUSER
PGPASSWORD_KEY = $(ENV)/PGPASSWORD
PGDATABASE_KEY = $(ENV)/PGDATABASE
PGPORT=5432
RETURN_RECORD_LIMIT=2
TEST_ACCOUNT=Person2
TEST_EVENT='{"transaction_id":"","account":"$(TEST_ACCOUNT)","graphqlRequestSender":"$(TEST_ACCOUNT)"}'
REGION=us-east-1
TEST_SENDER_ACCOUNT=Person1
LAMBDA_FUNCTION_NAME=req-query-account-$(ENV)

test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

clean:
	$(MAKE) clean-binary
	$(MAKE) clean-artifact
	$(MAKE) clean-vendor

clean-artifact:
		rm -f $(APP_NAME)-src.zip

clean-binary:
		rm -f $(BINARY_NAME)

clean-vendor:
	rm -rf vendor

###################### dependencies ######################

install:
	go mod vendor

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

# aliases build target
dev: build

# aliases build target
src: build

tidy:
	go mod tidy

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
		LAMBDA_FUNCTION_NAME=$(LAMBDA_FUNCTION_NAME) \
			go test -v --tags=integration ./cmd

test-local:
	@$(MAKE) -s test-env-arg
	PGHOST=$$(aws secretsmanager get-secret-value \
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
		RETURN_RECORD_LIMIT=$(RETURN_RECORD_LIMIT) \
		TEST_EVENT=$(TEST_EVENT) \
		go run ./cmd/main.go

###################### deploy ######################

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) build
	$(MAKE) deploy-only

deploy-only:
	@@$(MAKE) -s test-env-arg
	@ETAG=$$(aws s3api put-object \
		--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
		--key=$(APP_NAME)-src.zip \
		--body=$(DIR)/$(APP_NAME)-src.zip \
		--region=$(REGION) \
		--output=text | sed 's/"//g'); \
	echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

deploy-all:
	$(MAKE) deploy

# avoid aliasing deploy
initial-deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) clean
	$(MAKE) install
	$(MAKE) compile
	$(MAKE) zip
	@ETAG=$$(aws s3api put-object \
		--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
		--key=$(APP_NAME)-src.zip \
		--body=$(DIR)/$(APP_NAME)-src.zip \
		--region=$(REGION) \
		--output=text | sed 's/"//g'); \
	echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

###################### warm up ######################

warm-up:
	@$(MAKE) -s test-env-arg
	@aws lambda invoke \
		--region $(REGION) \
		--invocation-type RequestResponse \
		--function-name $(APP_NAME)-$(ENV) \
		--payload '{}' \
		invoke.log

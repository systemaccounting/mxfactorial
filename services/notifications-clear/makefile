APP_NAME=notifications-clear
CMD_DIR=$(CURDIR)/cmd
ARTIFACT_NAME=$(APP_NAME)-src.zip
ARTIFACT_BUCKET = mxfactorial-artifacts-$(ENV)
REGION=us-east-1
BINARY_NAME=index.handler
LAMBDA_OS=linux
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
	@$(DOCKER_ENV_VARS) go run ./cmd/main.go


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
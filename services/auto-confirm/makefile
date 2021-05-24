CMD_DIR = $(CURDIR)/cmd
APP_NAME = auto-confirm
ARTIFACT_NAME=$(APP_NAME)-src.zip
ARTIFACT_BUCKET = mxfactorial-artifacts-$(ENV)
REGION = us-east-1
BINARY_NAME = index.handler
LAMBDA_OS=linux
LAMBDA_NAME=$(APP_NAME)-$(ENV)
DEPLOY_APP=true
ENV_FILE=$(CURDIR)/.env
ENV_VARS := POOL_ID \
CLIENT_ID

test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

test-acc-arg:
ifndef ACC
		$(error trailing ACC assignment missing, e.g. make createuser ACC=testuser)
endif

signup:
	@$(MAKE) -s test-env-file
	@$(MAKE) -s test-acc-arg
	-@$(MAKE) rmuser
	eval $$(cat .env); aws cognito-idp sign-up \
		--region $(REGION) \
		--client-id $$CLIENT_ID \
		--username $(ACC) \
		--password $(ACC)

rmuser:
	@$(MAKE) -s test-env-file
	@$(MAKE) -s test-acc-arg
	eval $$(cat .env); aws cognito-idp admin-delete-user \
		--user-pool-id $$POOL_ID \
		--username $(ACC)

createuser:
	@$(MAKE) -s test-env-file
	@$(MAKE) -s test-acc-arg
	@eval $$(cat .env); aws cognito-idp admin-create-user \
		--user-pool-id $$POOL_ID \
		--username $(ACC) \
		--client-metadata skip=true \
		--query 'User.UserCreateDate'; \
	eval $$(cat .env); aws cognito-idp admin-set-user-password \
		--region $(REGION) \
		--user-pool-id $$POOL_ID \
		--username $(ACC) \
		--password $(ACC) \
		--permanent;

###################### clean ######################

clean:
	$(MAKE) clean-binary
	$(MAKE) clean-artifact

clean-artifact:
		rm -f $(APP_NAME)-src.zip

clean-binary:
		rm -f $(BINARY_NAME)

clean-env:
	rm -f .env

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
	else \
		ENV_VAR=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
		echo $@=$$ENV_VAR >> $(ENV_FILE); \
	fi

###################### warm up ######################

warm-up:
	@$(MAKE) -s test-env-arg
	@aws lambda invoke \
		--region $(REGION) \
		--invocation-type RequestResponse \
		--function-name $(LAMBDA_NAME) \
		--payload '{}' \
		invoke.log
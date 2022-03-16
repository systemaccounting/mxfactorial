APP_NAME = auto-confirm
CMD_DIR = $(CURDIR)/cmd
ARTIFACT_NAME=$(APP_NAME)-src.zip
RELATIVE_PROJECT_ROOT_PATH=../..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
BUCKET_PREFIX=$(shell jq -r '.artifacts_bucket_name_prefix' $(PROJECT_CONF))
ARTIFACT_BUCKET=$(BUCKET_PREFIX)-$(ENV)
REGION = us-east-1
EXECUTABLE_NAME=$(shell jq -r ".apps.\"$(APP_NAME)\".\"executable-name\"" $(PROJECT_CONF))
LAMBDA_NAME=$(APP_NAME)-$(ENV)
ENV_FILE=$(CURDIR)/.env

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

###################### dependencies ######################

install:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/download-go-mod.sh

###################### build ######################

build:
	@$(MAKE) -s clean
	$(MAKE) install
	$(MAKE) compile
	$(MAKE) zip

compile:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/compile-go-linux.sh \
		--app-name $(APP_NAME)

zip:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/zip-executable.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
		--executable-name $(EXECUTABLE_NAME)

###################### clean ######################

clean:
	$(MAKE) clean-binary
	$(MAKE) clean-artifact
	$(MAKE) clean-log

clean-binary:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-binary.sh \
		--app-name $(APP_NAME) \
		--binary-name $(EXECUTABLE_NAME)

clean-artifact:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-artifact.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME)

clean-log:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-invoke-log.sh \
		--app-name $(APP_NAME)

###################### secrets ######################

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

clean-env:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-env.sh \
		--app-name $(APP_NAME)

get-secrets:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/create-env.sh \
		--app-name $(APP_NAME) \
		--env $(ENV) \
		--region $(REGION)

###################### deploy ######################

put-object:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/put-object.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
        --env $(ENV) \
        --region $(REGION)

update-function:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/update-function.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
        --env $(ENV) \
        --region $(REGION)

initial-deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) build
	$(MAKE) put-object

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) build
	$(MAKE) put-object
	$(MAKE) update-function

deploy-only:
	@$(MAKE) -s test-env-arg
	$(MAKE) put-object
	$(MAKE) update-function

now:
	@$(MAKE) -s clean
	$(MAKE) compile
	$(MAKE) zip
	$(MAKE) deploy-only ENV=dev
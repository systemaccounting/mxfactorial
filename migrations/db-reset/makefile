APP_NAME = db-reset
ARTIFACT_NAME=$(APP_NAME)-src.zip
RELATIVE_PROJECT_ROOT_PATH=../..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
BUCKET_PREFIX=$(shell jq -r '.artifacts_bucket_name_prefix' $(PROJECT_CONF))
ARTIFACT_BUCKET=$(BUCKET_PREFIX)-$(ENV)
EXECUTABLE_NAME=$(shell jq -r ".apps.\"$(APP_NAME)\".executable_name" $(PROJECT_CONF))
RUNTIME=provided
REGION=us-east-1
BASH_LAYER_ARN=arn:aws:lambda:$(REGION):744348701589:layer:bash:8

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### build ######################

build:
	$(MAKE) zip

zip:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/zip-executable.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
		--executable-name $(EXECUTABLE_NAME)

###################### clean ######################

clean:
	$(MAKE) clean-artifact

clean-artifact:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-artifact.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME)

###################### deploy ######################

deploy:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s clean
	$(MAKE) zip
	$(MAKE) put-object
	$(MAKE) update-function

deploy-only:
	$(MAKE) put-object
	$(MAKE) update-function

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

# run before deploying terraform
initial-deploy:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s clean
	$(MAKE) zip
	$(MAKE) put-object

now:
	@$(MAKE) -s clean
	$(MAKE) zip
	$(MAKE) deploy-only ENV=dev
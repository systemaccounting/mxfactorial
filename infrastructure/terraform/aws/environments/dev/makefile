RELATIVE_PROJECT_ROOT_PATH=../../../../..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
TFSTATE_ENV_SUFFIX=$(shell jq -r ".terraform.tfstate.file_name_suffix.env_infra" $(PROJECT_CONF))
TFSTATE_EXT=$(shell jq -r ".terraform.tfstate.file_extension" $(PROJECT_CONF))
TFSTATE_ENV=$(TFSTATE_ENV_SUFFIX).$(TFSTATE_EXT)

### arg test
test-env-id-arg:
ifndef ENV_ID
	$(error trailing ENV_ID assignment missing, e.g. make init ENV_ID=12345)
endif

init:
	@$(MAKE) -s test-env-id-arg
	cd $(RELATIVE_PROJECT_ROOT_PATH); \
		bash scripts/set-custom-env-id.sh \
			--env-id $(ENV_ID); \
		bash scripts/terraform-init-dev.sh \
			--key $(TFSTATE_ENV) \
			--dir infrastructure/terraform/aws/environments/dev
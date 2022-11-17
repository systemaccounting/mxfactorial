RELATIVE_PROJECT_ROOT_PATH=../../../../..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
TFSTATE_ENV_SUFFIX=$(shell jq -r ".terraform.tfstate.file_name_suffix.env_infra" $(PROJECT_CONF))
TFSTATE_EXT=$(shell jq -r ".terraform.tfstate.file_extension" $(PROJECT_CONF))
TFSTATE_ENV=$(TFSTATE_ENV_SUFFIX).$(TFSTATE_EXT)

init:
	cd $(RELATIVE_PROJECT_ROOT_PATH); \
		bash scripts/terraform-init-dev.sh \
			--key $(TFSTATE_ENV) \
			--dir infrastructure/terraform/aws/environments/dev
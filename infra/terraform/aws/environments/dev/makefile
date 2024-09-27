RELATIVE_PROJECT_ROOT_PATH=../../../../..
PROJECT_CONF_FILE_NAME=project.yaml
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
TFSTATE_ENV_SUFFIX=$(shell yq '.infra.terraform.env_var.set.TFSTATE_ENV_SUFFIX.default' $(PROJECT_CONF))
TFSTATE_EXT=$(shell yq '.infra.terraform.env_var.set.TFSTATE_EXT.default' $(PROJECT_CONF))
TFSTATE_ENV=$(TFSTATE_ENV_SUFFIX).$(TFSTATE_EXT)

### arg test
test-env-id-arg:
ifndef ENV_ID
	$(error trailing ENV_ID assignment missing, e.g. make resume ENV_ID=12345)
endif

resume:
	@$(MAKE) -s test-env-id-arg
	cd $(RELATIVE_PROJECT_ROOT_PATH); \
		bash scripts/set-custom-env-id.sh \
			--env-id $(ENV_ID); \
		bash scripts/terraform-init-dev.sh \
			--key $(TFSTATE_ENV) \
			--dir infra/terraform/aws/environments/dev

init:
	cd $(RELATIVE_PROJECT_ROOT_PATH); \
		bash scripts/terraform-init-dev.sh \
			--key $(TFSTATE_ENV) \
			--dir infra/terraform/aws/environments/dev
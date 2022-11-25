INVENTORY_FILE=$(CURDIR)/inventory
SIZE=$(shell wc -l < "$(INVENTORY_FILE)" | awk '{print $$1}')
ifeq (0,$(SIZE))
  SIZE = 1
endif
PROJECT_CONF=project.json
SECRETS=$(shell jq '.secrets[]' $(PROJECT_CONF))
ENV_VARS=$(SECRETS)
REGION=$(shell jq -r ".region" $(PROJECT_CONF))
ENV_FILE=$(CURDIR)/.env
TFSTATE_ENV_SUFFIX=$(shell jq -r '.terraform.tfstate.file_name_suffix.env_infra' $(PROJECT_CONF))
TFSTATE_FILE_EXT=$(shell jq -r '.terraform.tfstate.file_extension' $(PROJECT_CONF))
TFSTATE_ENV_FILE=$(TFSTATE_ENV_SUFFIX).$(TFSTATE_FILE_EXT)

# approx 5 minutes
all:
	@$(MAKE) -s test-inv-file
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-cmd-arg
	@$(MAKE) -s test-cmd-val
ifeq (deploy,$(CMD))
	bash scripts/deploy-all.sh --env $(ENV)
endif
ifeq (initial-deploy,$(CMD))
	bash scripts/deploy-all.sh --env $(ENV) --initial
endif

.PHONY: inventory
inventory:
	@rm -f $(INVENTORY_FILE)
	@jq -r '.apps[] | select(.deploy==true) | .path' project.json | sort -r >> $(INVENTORY_FILE)
	@echo "project inventory size: $$(wc -l < "$(INVENTORY_FILE)" | xargs)"

size:
	@$(MAKE) -s test-inv-file
	@echo $(SIZE)

print:
	cat $(INVENTORY_FILE)

.PHONY: test
test:
	@$(MAKE) -s test-env-arg
	$(MAKE) -C './test' get-secrets ENV=$(ENV)
	$(MAKE) -C './test' test

install:
	brew install go
	go install github.com/99designs/gqlgen@latest
	go install github.com/golang/mock/mockgen@latest
	brew install node
	brew install awscli
	brew install warrensbox/tap/tfswitch
	brew install libpq
	brew link --force libpq
	brew install golang-migrate
	brew install jq
	npm install -g eslint
#	https://www.docker.com/products/docker-desktop

env-id:
	(cd infrastructure/terraform/env-id; terraform init && terraform apply --auto-approve)

build-dev:
	bash scripts/build-dev-env.sh

delete-dev:
	bash scripts/delete-dev-env.sh

init-dev:
	bash scripts/terraform-init-dev.sh \
		--key $(TFSTATE_ENV_FILE) \
		--dir infrastructure/terraform/aws/environments/dev

resume-dev:
	$(MAKE) -C infrastructure/terraform/aws/environments/dev resume

new-iam:
	bash scripts/manage-gitpod-iam.sh --new

delete-iam:
	bash scripts/manage-gitpod-iam.sh --delete

init:
	go mod init github.com/systemaccounting/mxfactorial

###################### secrets ######################

clean-env:
	rm -f $(ENV_FILE)

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

get-secrets:
	@$(MAKE) -s test-env-arg
	@bash scripts/create-env.sh \
		--app-name root \
		--env $(ENV) \
		--region $(REGION)

### arg tests
test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make all ENV=stg)
endif

test-cmd-arg:
ifndef CMD
	$(error trailing CMD assignment missing, e.g. make all CMD=initial-deploy)
endif

test-cmd-val:
ifneq ($(CMD),$(filter $(CMD),deploy initial-deploy))
	$(error trailing CMD assignment must be 'deploy' or 'initial-deploy')
endif

test-inv-file:
ifeq (,$(wildcard $(INVENTORY_FILE)))
	$(error no inventory file, run 'make inventory')
endif
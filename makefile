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
COMPOSE_DIR=./docker

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
	$(MAKE) test-compose-up

test-compose-up:
	@$(MAKE) -C './test' test-compose-up

test-docker:
	@$(MAKE) -C './test' test-docker

test-cloud:
	@$(MAKE) -C './test' test-cloud

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

###################### docker ######################

test-up:
	@$(MAKE) test && $(MAKE) compose-up

compose-build:
	bash scripts/compose.sh --build

compose-up:
	bash scripts/compose.sh --up

compose-up-build:
	bash scripts/compose.sh --up --build

compose-down:
	bash scripts/compose.sh --down

rebuild-db:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose \
		-f ./docker/compose.bitnami-postgres.yaml \
		up \
		-d \
		--force-recreate \
		--renew-anon-volumes

rebuild-rules:
	@bash scripts/rebuild-service.sh --name rules

rebuild-request-create:
	@bash scripts/rebuild-service.sh --name request-create

rebuild-request-approve:
	@bash scripts/rebuild-service.sh --name request-approve

rebuild-balance-by-account:
	@bash scripts/rebuild-service.sh --name balance-by-account

rebuild-request-by-id:
	@bash scripts/rebuild-service.sh --name request-by-id

rebuild-requests-by-account:
	@bash scripts/rebuild-service.sh --name requests-by-account

rebuild-transaction-by-id:
	@bash scripts/rebuild-service.sh --name transaction-by-id

rebuild-transactions-by-account:
	@bash scripts/rebuild-service.sh --name transactions-by-account

rebuild-graphql:
	@bash scripts/rebuild-service.sh --name graphql --no-db

rebuild-client:
	@bash scripts/rebuild-service.sh --name client --no-db

###################### demo ######################

bootcamp:
	@bash scripts/bootcamp.sh

rules:
	@$(MAKE) -C ./services/rules demo-docker

request-create:
	@$(MAKE) -C ./services/request-create demo-docker

request-approve:
	@$(MAKE) -C ./services/request-approve demo-docker

balance-by-account:
	@$(MAKE) -C ./services/balance-by-account demo-docker

request-by-id:
	@$(MAKE) -C ./services/request-by-id demo-docker

requests-by-account:
	@$(MAKE) -C ./services/requests-by-account demo-docker

transaction-by-id:
	@$(MAKE) -C ./services/transaction-by-id demo-docker

transactions-by-account:
	@$(MAKE) -C ./services/transactions-by-account demo-docker

###################### postgres ######################

dump-testseed:
	@$(MAKE) -C ./migrations/dumps dump-testseed

restore-testseed:
	@$(MAKE) -C ./migrations/dumps restore-testseed

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
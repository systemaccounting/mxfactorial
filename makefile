SHELL:=/bin/bash
INVENTORY_FILE=$(CURDIR)/inventory
SIZE=$(shell wc -l < "$(INVENTORY_FILE)" | awk '{print $$1}')
ifeq (0,$(SIZE))
  SIZE = 1
endif
PROJECT_CONF=project.yaml
SECRETS=$(shell yq '.env_var.get[]' $(PROJECT_CONF))
ENV_VARS=$(SECRETS)
REGION=$(shell yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $(PROJECT_CONF))
ENV_FILE_NAME=$(shell yq '.env_var.set.ENV_FILE_NAME.default' $(PROJECT_CONF))
ENV_FILE=$(CURDIR)/$(ENV_FILE_NAME)
TFSTATE_ENV_SUFFIX=$(shell yq '.infra.terraform.env_var.set.TFSTATE_ENV_SUFFIX.default' $(PROJECT_CONF))
TFSTATE_EXT=$(shell yq '.infra.terraform.env_var.set.TFSTATE_EXT.default' $(PROJECT_CONF))
TFSTATE_ENV_FILE=$(TFSTATE_ENV_SUFFIX).$(TFSTATE_EXT)
COMPOSE_DIR=./docker
NOHUP_LOG=$(shell yq '.env_var.set.NOHUP_LOG.default' $(PROJECT_CONF))
REDIS_DB=$(shell yq '.services.event.env_var.set.REDIS_DB.default' $(PROJECT_CONF))
REDIS_USERNAME=$(shell yq '.services.event.env_var.set.REDIS_USERNAME.default' $(PROJECT_CONF))
REDIS_PASSWORD=$(shell yq '.services.event.env_var.set.REDIS_PASSWORD.default' $(PROJECT_CONF))
REDIS_PORT=$(shell yq '.services.event.env_var.set.REDIS_PORT.default' $(PROJECT_CONF))
REDIS_HOST=$(shell yq '.services.event.env_var.set.REDIS_HOST.default' $(PROJECT_CONF))
include make/cloud-env.mk
include make/docker.mk

# approx 10 minutes
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
	@bash scripts/create-inventory.sh
	@echo "project inventory size: $$(wc -l < "$(INVENTORY_FILE)" | xargs)"

list-env-vars:
	@bash scripts/list-env-vars.sh

size:
	@$(MAKE) -s test-inv-file
	@echo $(SIZE)

print:
	cat $(INVENTORY_FILE)

.PHONY: test
test:
	$(MAKE) test-local

test-compose-up:
	@$(MAKE) -C './tests' test-compose-up

test-docker:
	@$(MAKE) -C './tests' test-docker

test-cloud:
	@$(MAKE) -C './tests' test-cloud

test-local:
	@$(MAKE) -C './tests' test-local

rust-coverage:
ifndef RUST_PKG
	@cargo llvm-cov >/dev/null 2>&1
	@cargo llvm-cov report 2>/dev/null
else
	@cargo llvm-cov -p $(RUST_PKG) >/dev/null 2>&1
	@cargo llvm-cov report -p $(RUST_PKG) 2>/dev/null
endif

rust-coverage-percent:
	@$(MAKE) rust-coverage | grep TOTAL | awk '{print $$10}' | cut -d '.' -f1

install:
	brew install node
	brew install awscli
	brew install warrensbox/tap/tfswitch
	brew install libpq
	brew link --force libpq
	brew install golang-migrate
	brew install yq
	npm install -g eslint
#   rust
	curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
	rustup component add llvm-tools-preview --toolchain stable-x86_64-apple-darwin
#	https://www.docker.com/products/docker-desktop
	cargo install cargo-watch
	cargo install cargo-llvm-cov

help:
	@grep -v '^\t' makefile | grep -v '^#' | grep '^[[:lower:]]' | grep -v '^if' | grep -v '^end' | sed 's/://g'

start:
	bash scripts/start-local.sh

stop:
	bash scripts/stop-local.sh

restart:
	$(MAKE) stop
	$(MAKE) start

logs:
	tail -F $(NOHUP_LOG)

list-pids:
	@bash scripts/list-pids.sh

list-used-ports:
	@source scripts/list-env-vars.sh | grep --color=never -E "PORT$$" | xargs -I{} yq ".. | select(has(\"{}\")) | select(.{}) | .{}.default" $(PROJECT_CONF) | sort

clean:
	@APP_DIRS=($$(yq '.. | select(has("local_dev") and .local_dev == true) | path | join("/")' $(PROJECT_CONF))); \
	for d in "$${APP_DIRS[@]}"; do \
		$(MAKE) --no-print-directory -C "$$d" clean; \
	done
	@$(MAKE) --no-print-directory -C tests clean
	@rm -f ./$(NOHUP_LOG)

redis-uri:
	@echo "redis://$(REDIS_USERNAME):$(REDIS_PASSWORD)@$(REDIS_HOST):$(REDIS_PORT)/$(REDIS_DB)"

###################### demo ######################

bootcamp:
	@bash scripts/bootcamp.sh

rule:
	@$(MAKE) -C ./services/rule demo

request-create:
	@$(MAKE) -C ./services/request-create demo

request-approve:
	@$(MAKE) -C ./services/request-approve demo

balance-by-account:
	@$(MAKE) -C ./services/balance-by-account demo

request-by-id:
	@$(MAKE) -C ./services/request-by-id demo

requests-by-account:
	@$(MAKE) -C ./services/requests-by-account demo

transaction-by-id:
	@$(MAKE) -C ./services/transaction-by-id demo

transactions-by-account:
	@$(MAKE) -C ./services/transactions-by-account demo

###################### postgres ######################

insert:
	@$(MAKE) -C ./migrations insert

continue-insert:
	bash scripts/insert-transactions.sh --continue

###################### secrets ######################

clean-env:
	rm -f $(ENV_FILE)

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

get-secrets:
	@$(MAKE) -s test-env-arg
	@bash scripts/create-env-file.sh \
		--app-name root \
		--env $(ENV)

### arg tests
test-env-arg:
ifndef ENV
	$(info trailing ENV assignment missing, e.g. make env ENV=dev|stg|prod, defaulting to 'local')
ENV=local
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
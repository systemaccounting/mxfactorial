SHELL=/bin/bash
APP_NAME=$(shell basename $(CURDIR))
RELATIVE_PROJECT_ROOT_PATH=..
PROJECT_CONF_FILE_NAME=project.yaml
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
ENV_ID=$(shell (cd $(RELATIVE_PROJECT_ROOT_PATH); ENV=$(ENV) PROJECT_CONF=$(PROJECT_CONF) . ./scripts/print-env-id.sh))
ENV_FILE_NAME=$(shell yq '.env_var.set.ENV_FILE_NAME.default' $(PROJECT_CONF))
ENV_FILE=$(CURDIR)/$(ENV_FILE_NAME)
GO_MIGRATE=github.com/golang-migrate/migrate/v4/cmd/migrate@latest
SQL_TYPE=$(shell yq ".migrations.env_var.set.SQL_TYPE.default" $(PROJECT_CONF))
MIGRATIONS_DIR=$(CURDIR)/$(DIR)

# go-migrate lambda vars
MIGRATION_LAMBDA_NAME=go-migrate-$(ENV_ID)-$(ENV)
REGION=$(shell yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $(PROJECT_CONF))
SSM_VERSION=$(shell yq '.infra.terraform.aws.modules.environment.env_var.set.SSM_VERSION.default' $(PROJECT_CONF))
GO_MIGRATE_PASSPHRASE=$(shell aws ssm get-parameter \
	--name /$(ENV_ID)/$(SSM_VERSION)/$(ENV)/tool/lambda/go_migrate/passphrase \
	--query 'Parameter.Value' \
	--region $(REGION) \
	--with-decryption \
	--output text)

run:
	@$(MAKE) start

# postgres docker
start:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose \
			-f $(RELATIVE_PROJECT_ROOT_PATH)/docker/compose.yaml \
			up \
			-d \
			postgres \
			--renew-anon-volumes \
			--force-recreate \
			--build
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash ./scripts/enable-pg-notice.sh > /dev/null

reset:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose \
			-f $(RELATIVE_PROJECT_ROOT_PATH)/docker/compose.yaml \
			up \
			-d \
			postgres \
			--renew-anon-volumes \
			--force-recreate
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash ./scripts/enable-pg-notice.sh > /dev/null

rebuild:
	@docker compose \
		-f $(RELATIVE_PROJECT_ROOT_PATH)/docker/compose.yaml \
		build \
		postgres \
		--no-cache

up:
	@$(MAKE) run

down:
	@docker compose \
		-f $(RELATIVE_PROJECT_ROOT_PATH)/docker/compose.yaml \
		down

stop:
	@$(MAKE) down

clean:
	-@$(MAKE) stop

prune-builder:
	docker builder prune -f

###################### migration file management ######################

init:
	@$(MAKE) -s test-dir-arg
	migrate create -ext sql -dir $(MIGRATIONS_DIR) -seq init_schema

create:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-name-arg
	migrate -verbose create -ext sql -dir $(MIGRATIONS_DIR) -seq $(NAME)

###################### general migrate command ######################

migrate:
	@rm -f $(ENV_FILE)
	@$(MAKE) -s get-secrets
	@$(MAKE) -s test-env-file
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	eval $$(cat $(ENV_FILE)); source ./go-migrate/migrate.sh --dir $(CURDIR) --db_type $(DB) --cmd $(CMD)

###################### local/docker migrate commands ######################

resetdocker:
	$(MAKE) migrate ENV=local DB=test CMD=reset

rl:
	$(MAKE) resetdocker

downdocker:
	$(MAKE) migrate ENV=local DB=test CMD=down

testdocker:
	$(MAKE) resetdocker
	$(MAKE) downdocker

updocker:
	$(MAKE) migrate ENV=local DB=test CMD=up

dropdocker:
	$(MAKE) migrate ENV=local DB=test CMD=drop

insert:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/insert-transactions.sh

###################### rds migrate commands ######################

resetrds:
	$(MAKE) migrate ENV=dev DB=test CMD=reset

downrds:
	$(MAKE) migrate ENV=dev DB=test CMD=down

testrds:
	@$(MAKE) resetrds
	@$(MAKE) downrds

uprds:
	$(MAKE) migrate ENV=dev DB=test CMD=up

droprds:
	$(MAKE) migrate ENV=dev DB=test CMD=drop

###################### invoke migrate lambda ######################

# make deploy-migrations ENV=dev BRANCH=develop DB=test CMD=up
deploy-migrations:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	@$(MAKE) -s test-branch-arg
	@$(MAKE) -s test-cmd-arg
	@$(MAKE) -s test-env-arg
	@aws lambda invoke \
		--region $(REGION) \
		--invocation-type RequestResponse \
		--function-name $(MIGRATION_LAMBDA_NAME) \
		--payload "$$(echo '{"branch":"$(BRANCH)","cmd":"$(CMD)","db_type":"$(DB)","passphrase":"$(GO_MIGRATE_PASSPHRASE)"}' | base64)" \
		invoke.log

install-ci:
	go install -tags '$(SQL_TYPE)' $(GO_MIGRATE)
	sudo apt update
	sudo apt install -y postgresql-client

###################### arg tests ######################

test-db-arg:
ifndef DB
	$(error trailing DB assignment missing, e.g. make up DB=test, or DB=prod)
endif

test-db-val:
ifneq ($(DB),$(filter $(DB),test prod))
	$(error trailing DB assignment must be 'test' or 'prod')
endif

test-dir-arg:
ifndef DIR
	$(error trailing DIR assignment missing, e.g. make up DIR=schema)
endif

test-name-arg:
ifndef NAME
	$(error trailing NAME assignment missing, e.g. make create NAME=rule)
endif

test-cmd-arg:
ifndef CMD
	$(error trailing CMD assignment missing, e.g. make deploy-migrations CMD=up)
endif

test-env-arg:
ifndef ENV
	$(info trailing ENV assignment missing, e.g. make env ENV=dev|stg|prod, defaulting to 'local')
ENV=local
endif

test-branch-arg:
ifndef BRANCH
	$(error trailing BRANCH assignment missing, e.g. BRANCH=your-branch-name)
endif

###################### secrets ######################

clean-env:
	rm -f $(ENV_FILE)

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

env:
	@$(MAKE) get-secrets

get-secrets:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/create-env-file.sh \
		--app-name $(APP_NAME) \
		--env $(ENV)
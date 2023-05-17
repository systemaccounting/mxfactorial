SHELL=/bin/bash
APP=mxfactorial
RELATIVE_PROJECT_ROOT_PATH=..
PROJECT_CONF_FILE_NAME=project.yaml
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
ENV_ID=$(shell (cd $(RELATIVE_PROJECT_ROOT_PATH); ENV=$(ENV) PROJECT_CONF=$(PROJECT_CONF) . ./scripts/print-env-id.sh))
ENV_FILE_NAME=$(shell yq '.env_var.set.ENV_FILE_NAME.default' $(PROJECT_CONF))
ENV_FILE=$(CURDIR)/$(ENV_FILE_NAME)
SSM_VERSION=$(shell yq '.infrastructure.terraform.aws.modules.environment.env_var.set.SSM_VERSION.default' $(PROJECT_CONF))
GO_MIGRATE=github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# migration lambda vars
MIGRATION_LAMBDA_NAME=go-migrate-$(ENV_ID)-$(ENV)
REGION=$(shell yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $(PROJECT_CONF))

RDS_ENV_VARS=DATABASE_TYPE \
PGUSER \
PGPASSWORD \
PGHOST \
PGPORT \
PGDATABASE

PG_CONF_PATH=.infrastructure.terraform.aws.modules.environment.env_var.set
DATABASE_TYPE=postgres
PGHOST=$(shell yq "$(PG_CONF_PATH).PGHOST.default" $(PROJECT_CONF))
PGPORT=$(shell yq "$(PG_CONF_PATH).PGPORT.default" $(PROJECT_CONF))
PGDATABASE=$(shell yq "$(PG_CONF_PATH).PGDATABASE.default" $(PROJECT_CONF))
PGUSER=$(shell yq "$(PG_CONF_PATH).PGUSER.default" $(PROJECT_CONF))
PGPASSWORD=$(shell yq "$(PG_CONF_PATH).PGPASSWORD.default" $(PROJECT_CONF))
CONTAINER_PORT=$(PGPORT)

MIGRATIONS_CONN=$(DATABASE_TYPE)://$(PGUSER):$(PGPASSWORD)@$(PGHOST):$(PGPORT)/$(PGDATABASE)?sslmode=disable&x-migrations-table=migration_$(DIR)_version
MIGRATIONS_DIR=$(CURDIR)/$(DIR)

# case intended, values matched from make cli args
prod_up = schema seed
prod_down = seed schema
test_up = $(prod_up) testseed
test_down = testseed $(prod_down)

run:
	@$(MAKE) start

# postgres docker
start:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose \
			-f ../docker/compose.bitnami-postgres.yaml \
			up \
			-d \
			--renew-anon-volumes \
			--force-recreate \
			--build

reset:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose \
			-f $(RELATIVE_PROJECT_ROOT_PATH)/docker/compose.bitnami-postgres.yaml \
			up \
			-d \
			--renew-anon-volumes \
			--force-recreate

up:
	@$(MAKE) run

down:
	docker compose \
		-f $(RELATIVE_PROJECT_ROOT_PATH)/docker/compose.bitnami-postgres.yaml down

stop:
	@$(MAKE) down

clean:
	-@$(MAKE) stop

# looped go migrate targets for docker postgres
# 2022-07-12: down migrate required until 9 month old pr merged:
# https://github.com/golang-migrate/migrate/pull/627
resetdocker:
	@TABLE_COUNT=$$(psql \
		-At "host=$(PGHOST) port=$(CONTAINER_PORT) user=$(PGUSER) password=$(PGPASSWORD) dbname=$(PGDATABASE)" \
		-tc "select count(*) from information_schema.tables where table_schema = 'public';"); \
	if [ "$$TABLE_COUNT" -gt 3 ]; then \
		echo "***down migrating docker"; \
		$(MAKE) downdocker DB=test; \
		$(MAKE) dropdocker DB=test; \
	fi; \
	echo "***up migrating docker"; \
	$(MAKE) updocker DB=test

testdocker:
	$(MAKE) resetdocker
	$(MAKE) downdocker DB=test

updocker:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(foreach DIR,$($(DB)_up), migrate -verbose -path ./$(DIR) -database "$(MIGRATIONS_CONN)" up;)

downdocker:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(foreach DIR,$($(DB)_down), migrate -verbose -path ./$(DIR) -database "$(MIGRATIONS_CONN)" down --all;)

dropdocker:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(foreach DIR,$($(DB)_down), migrate -verbose -path ./$(DIR) -database "$(MIGRATIONS_CONN)" drop -f;)

insert:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/insert-transactions.sh

# looped go migrate targets for rds postgres
resetrds:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(MAKE) get-secrets
	@while read -r i; do export "$$i"; done < $(ENV_FILE); \
	TABLE_COUNT=$$(psql \
		-tc "select count(*) from information_schema.tables where table_schema = 'public';"); \
	if [ "$$TABLE_COUNT" -gt 3 ]; then \
		echo "***down migrating rds"; \
		$(MAKE) downrds DB=test; \
		$(MAKE) droprds DB=test; \
	fi; \
	echo "***up migrating rds"; \
	$(MAKE) uprds DB=test

testrds:
	$(MAKE) resetrds
	$(MAKE) downrds DB=test

uprds:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(MAKE) get-secrets
	$(foreach DIR,$($(DB)_up), eval $$(cat $(ENV_FILE)); migrate -verbose -path ./$(DIR) -database "$$DATABASE_TYPE://$$PGUSER:$$PGPASSWORD@$$PGHOST:$$PGPORT/$$PGDATABASE?sslmode=require&x-migrations-table=migration_$(DIR)_version" up;)

downrds:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(MAKE) get-secrets
	$(foreach DIR,$($(DB)_down), eval $$(cat $(ENV_FILE)); migrate -verbose -path ./$(DIR) -database "$$DATABASE_TYPE://$$PGUSER:$$PGPASSWORD@$$PGHOST:$$PGPORT/$$PGDATABASE?sslmode=require&x-migrations-table=migration_$(DIR)_version" down --all;)

droprds:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(MAKE) get-secrets
	$(foreach DIR,$($(DB)_down), eval $$(cat $(ENV_FILE)); migrate -verbose -path ./$(DIR) -database "$$DATABASE_TYPE://$$PGUSER:$$PGPASSWORD@$$PGHOST:$$PGPORT/$$PGDATABASE?sslmode=require&x-migrations-table=migration_$(DIR)_version" drop -f;)

# local go migrate
init:
	@$(MAKE) -s test-dir-arg
	migrate create -ext sql -dir $(MIGRATIONS_DIR) -seq init_schema

create:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-name-arg
	migrate -verbose create -ext sql -dir $(MIGRATIONS_DIR) -seq $(NAME)

updir:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-count-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(MIGRATIONS_CONN)" up $(COUNT)

downdir:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-count-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(MIGRATIONS_CONN)" down $(COUNT)

updirall:
	@$(MAKE) -s test-dir-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(MIGRATIONS_CONN)" up

downdirall:
	@$(MAKE) -s test-dir-arg
	yes | migrate -verbose -path $(MIGRATIONS_DIR) -database "$(MIGRATIONS_CONN)" down

dropdir:
	@$(MAKE) -s test-dir-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(MIGRATIONS_CONN)" drop -f

force:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-version-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(MIGRATIONS_CONN)" force $(VERSION)

clear:
	$(MAKE) drop

# lambda
# e.g. make deploy-migrations ENV=dev DIR=migrations BRANCH=199/db-item-transaction CMD=up COUNT=all
deploy-migrations:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-branch-arg
	@$(MAKE) -s test-cmd-arg
	@$(MAKE) -s test-cmd-count-arg
	@$(MAKE) -s test-force-version-arg
	@$(MAKE) -s test-env-arg
	@aws lambda invoke \
		--region $(REGION) \
		--invocation-type RequestResponse \
		--function-name $(MIGRATION_LAMBDA_NAME) \
		--payload "$$(echo '{"branch":"$(BRANCH)","command":"$(CMD)","count":"$(COUNT)","version":"$(VERSION)","directory":"$(DIR)"}' | base64)" \
		invoke.log

# make lambda-up-all DB=test ENV=dev BRANCH=199/db-item-transaction
lambda-up-all:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-branch-arg
	$(foreach DIR,$($(DB)_up), $(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=up COUNT=all;)

# make lambda-down-all DB=test ENV=dev BRANCH=199/db-item-transaction
lambda-down-all:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-branch-arg
	$(foreach DIR,$($(DB)_down), $(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=down COUNT=all;)

# make lambda-drop-all DB=test ENV=dev BRANCH=199/db-item-transaction
lambda-drop-all:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-branch-arg
	$(foreach DIR,$($(DB)_down), $(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=drop COUNT=all;)

install-ci:
	go install -tags '$(DATABASE_TYPE)' $(GO_MIGRATE)
	sudo apt update
	sudo apt install -y postgresql-client

# arg tests
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

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

test-name-arg:
ifndef NAME
	$(error trailing NAME assignment missing, e.g. make create NAME=rule)
endif

test-cmd-arg:
ifndef CMD
	$(error trailing CMD assignment missing, e.g. make deploy-migrations CMD=up)
endif

test-count-arg:
ifndef COUNT
	$(error trailing COUNT assignment missing, e.g. make up COUNT=3, OR make up COUNT=all)
endif

test-cmd-count-arg:
ifeq ($(CMD),$(filter $(CMD),up down))
	@$(MAKE) -s test-count-arg
endif

test-version-arg:
ifndef VERSION
	$(error trailing VERSION assignment missing, e.g. make force VERSION=7)
endif

test-force-version-arg:
ifeq ($(CMD),force)
	@$(MAKE) -s test-version-arg
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

get-secrets:
	@$(MAKE) -s retrieve-each-secret
	@if [ ! -s $(ENV_FILE) ]; then \
		rm $(ENV_FILE); \
		echo 'no env vars required'; \
	else \
		echo 'env vars retrieved'; \
	fi

retrieve-each-secret: test-env-arg clean-env $(RDS_ENV_VARS)
$(RDS_ENV_VARS):
	@if [ $@ = DATABASE_TYPE ]; then \
		echo DATABASE_TYPE=$(DATABASE_TYPE) >> $(ENV_FILE); \
	else \
		PARAM_NAME=$(shell yq '... | select(has("$@")).$@.ssm' $(PROJECT_CONF)); \
		ENV_VAR=$$(aws ssm get-parameter \
			--name /$(ENV_ID)/$(SSM_VERSION)/$(ENV)/$$PARAM_NAME \
			--query 'Parameter.Value' \
			--with-decryption \
			--region $(REGION) \
			--output text); \
		echo "$@=$$ENV_VAR" >> $(ENV_FILE); \
	fi

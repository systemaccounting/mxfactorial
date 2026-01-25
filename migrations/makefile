SHELL=/bin/bash
RELATIVE_PROJECT_ROOT_PATH=..
PROJECT_CONF_FILE_NAME=project.yaml
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
MIGRATIONS_DIR=$(CURDIR)/$(DIR)
APP_NAME=$(shell basename $(CURDIR))

run:
	@$(MAKE) start

# postgres docker
start:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose \
			-f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml \
			up \
			-d \
			postgres \
			--renew-anon-volumes \
			--force-recreate \
			--build
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash ./scripts/enable-pg-notice.sh > /dev/null

reset:
	@$(MAKE) resetdocker

warm-cache:
	@docker compose -f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml up warm-cache

rebuild:
	@docker compose \
		-f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml \
		build \
		postgres \
		--no-cache

up:
	@$(MAKE) run

down:
	@docker compose \
		-f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml \
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

###################### local/docker migrate commands ######################

resetdocker:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose -f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml run --rm go-migrate --db_type test --cmd reset 2>&1 | grep -v "No services to build"

downdocker:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose -f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml run --rm go-migrate --db_type test --cmd down 2>&1 | grep -v "No services to build"

testdocker:
	$(MAKE) resetdocker
	$(MAKE) downdocker

updocker:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose -f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml run --rm go-migrate --db_type test --cmd up 2>&1 | grep -v "No services to build"

dropdocker:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose -f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml run --rm go-migrate --db_type test --cmd drop 2>&1 | grep -v "No services to build"

insert:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/insert-transactions.sh

###################### env ######################

env:
	@$(MAKE) get-secrets

get-secrets:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/create-env-file.sh \
		--app-name $(APP_NAME) \
		--env $(ENV)

###################### arg tests ######################

test-env-arg:
ifndef ENV
	$(info trailing ENV assignment missing, e.g. make env ENV=dev|stg|prod, defaulting to 'local')
ENV=local
endif

test-dir-arg:
ifndef DIR
	$(error trailing DIR assignment missing, e.g. make up DIR=schema)
endif

test-name-arg:
ifndef NAME
	$(error trailing NAME assignment missing, e.g. make create NAME=rule)
endif
SHELL=/bin/bash
RELATIVE_PROJECT_ROOT_PATH=..
PROJECT_CONF_FILE_NAME=project.yaml
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
MIGRATIONS_DIR=$(CURDIR)/$(DIR)
APP_NAME=$(shell basename $(CURDIR))
ENV_FILE_NAME=$(shell yq '.env_var.set.ENV_FILE_NAME.default' $(PROJECT_CONF))
ENV_FILE=$(CURDIR)/$(ENV_FILE_NAME)

run:
	@$(MAKE) start

# postgres docker
# build postgres image and start postgres + redis
start:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose \
			-f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml \
			up \
			-d \
			--wait \
			postgres \
			redis \
			--renew-anon-volumes \
			--force-recreate \
			--build

# start postgres + redis from pre-built image (CI uses this after
# building postgres image with --target base cache, see
# .github/workflows/crates-postgres.yaml)
start-nobuild:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose \
			-f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml \
			up \
			-d \
			--wait \
			postgres \
			redis \
			--renew-anon-volumes \
			--force-recreate
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash ./scripts/enable-pg-notice.sh > /dev/null

reset:
	@$(MAKE) resetdocker

.PHONY: warm-cache
warm-cache:
	@docker compose -f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml run --rm warm-cache

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
		docker compose -f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml run --rm go-migrate --subdirs schema,seed,testseed --cmd reset 2>&1 | grep -v "No services to build"

downdocker:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose -f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml run --rm go-migrate --subdirs schema,seed,testseed --cmd down 2>&1 | grep -v "No services to build"

testdocker:
	$(MAKE) resetdocker
	$(MAKE) downdocker

updocker:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose -f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml run --rm go-migrate --subdirs schema,seed,testseed --cmd up 2>&1 | grep -v "No services to build"

dropdocker:
	@COMPOSE_IGNORE_ORPHANS=true \
		docker compose -f $(RELATIVE_PROJECT_ROOT_PATH)/docker/storage.yaml run --rm go-migrate --subdirs schema,seed,testseed --cmd drop 2>&1 | grep -v "No services to build"

insert:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/insert-transactions.sh --continue

thresh-up:
	@set -a && source $(ENV_FILE) && set +a && SQL_TYPE=postgresql bash $(RELATIVE_PROJECT_ROOT_PATH)/migrations/go-migrate/migrate.sh --dir $(RELATIVE_PROJECT_ROOT_PATH)/migrations --subdirs testseedthresh --cmd up
	@$(MAKE) warm-cache

thresh-down:
	@set -a && source $(ENV_FILE) && set +a && SQL_TYPE=postgresql bash $(RELATIVE_PROJECT_ROOT_PATH)/migrations/go-migrate/migrate.sh --dir $(RELATIVE_PROJECT_ROOT_PATH)/migrations --subdirs testseedthresh --cmd down

cron-up:
	@set -a && source $(ENV_FILE) && set +a && SQL_TYPE=postgresql bash $(RELATIVE_PROJECT_ROOT_PATH)/migrations/go-migrate/migrate.sh --dir $(RELATIVE_PROJECT_ROOT_PATH)/migrations --subdirs testseedcron --cmd up
	@$(MAKE) warm-cache

cron-down:
	@set -a && source $(ENV_FILE) && set +a && SQL_TYPE=postgresql bash $(RELATIVE_PROJECT_ROOT_PATH)/migrations/go-migrate/migrate.sh --dir $(RELATIVE_PROJECT_ROOT_PATH)/migrations --subdirs testseedcron --cmd down

# poll for cron transactions (waits 15 seconds for pg_cron to fire)
wait-cron:
	@for i in $$(seq 1 15); do printf '#'; sleep 1; done; echo

# poll redis accumulator until threshold fires (value resets)
wait-thresh:
	@key=$$(docker exec mxf-redis-1 redis-cli -a test --no-auth-warning KEYS '*accumulator' 2>/dev/null | head -1); \
	while [ -z "$$key" ]; do \
		sleep 2; \
		key=$$(docker exec mxf-redis-1 redis-cli -a test --no-auth-warning KEYS '*accumulator' 2>/dev/null | head -1); \
	done; \
	prev=0; \
	while true; do \
		val=$$(docker exec mxf-redis-1 redis-cli -a test --no-auth-warning GET "$$key" 2>/dev/null | tr -d '"'); \
		if [ -z "$$val" ] || [ "$$val" = "(nil)" ]; then sleep 2; continue; fi; \
		echo "accumulator: $$val"; \
		if [ "$$(echo "$$val < $$prev" | bc -l)" = "1" ]; then echo "threshold fired"; break; fi; \
		prev=$$val; \
		sleep 2; \
	done

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
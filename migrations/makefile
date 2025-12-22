SHELL=/bin/bash
RELATIVE_PROJECT_ROOT_PATH=..
PROJECT_CONF_FILE_NAME=project.yaml
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
MIGRATIONS_DIR=$(CURDIR)/$(DIR)

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
	@$(MAKE) resetdocker

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

###################### local/docker migrate commands ######################

resetdocker:
	@docker compose -f $(RELATIVE_PROJECT_ROOT_PATH)/docker/compose.yaml run --rm go-migrate --db_type test --cmd reset

rl:
	$(MAKE) resetdocker

downdocker:
	@docker compose -f $(RELATIVE_PROJECT_ROOT_PATH)/docker/compose.yaml run --rm go-migrate --db_type test --cmd down

testdocker:
	$(MAKE) resetdocker
	$(MAKE) downdocker

updocker:
	@docker compose -f $(RELATIVE_PROJECT_ROOT_PATH)/docker/compose.yaml run --rm go-migrate --db_type test --cmd up

dropdocker:
	@docker compose -f $(RELATIVE_PROJECT_ROOT_PATH)/docker/compose.yaml run --rm go-migrate --db_type test --cmd drop

insert:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/insert-transactions.sh

###################### rds migrate commands ######################

resetrds:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash scripts/go-migrate-rds.sh --env dev --cmd reset

downrds:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash scripts/go-migrate-rds.sh --env dev --cmd down

testrds:
	@$(MAKE) resetrds
	@$(MAKE) downrds

uprds:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash scripts/go-migrate-rds.sh --env dev --cmd up

droprds:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash scripts/go-migrate-rds.sh --env dev --cmd drop

###################### arg tests ######################

test-dir-arg:
ifndef DIR
	$(error trailing DIR assignment missing, e.g. make up DIR=schema)
endif

test-name-arg:
ifndef NAME
	$(error trailing NAME assignment missing, e.g. make create NAME=rule)
endif
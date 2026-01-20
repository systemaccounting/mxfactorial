SHELL := /bin/bash
RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
APP_NAME=$(shell basename $(CURDIR))
PROJECT_CONF_FILE_NAME=project.yaml
TEST_NAME?=model::integration_tests::
MIGRATIONS_DIR=$(RELATIVE_PROJECT_ROOT_PATH)/migrations

test-unit:
	cargo test

test-lint:
	cargo fmt -- --check
	cargo clippy -- -Dwarnings

test:
	$(MAKE) test-lint
	$(MAKE) test-unit

watch:
	cargo watch -x test

watch-db:
	trap "$(MAKE) stop" SIGINT; cargo watch -c -- $(MAKE) test-db

test-db:
	@$(MAKE) get-secrets
	@if [[ $$(pg_isready -h localhost) ]]; then \
		$(MAKE) -C $(MIGRATIONS_DIR) reset; \
	else \
		$(MAKE) -C $(MIGRATIONS_DIR) start; \
	fi
	@until pg_isready -h localhost; do sleep 1; done
	cargo test $(TEST_NAME) --features db_tests -- --test-threads=1

stop:
	@$(MAKE) -C $(RELATIVE_PROJECT_ROOT_PATH) stop

env:
	@$(MAKE) get-secrets

get-secrets:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/create-env-file.sh \
		--app-name $(APP_NAME) \
		--env local
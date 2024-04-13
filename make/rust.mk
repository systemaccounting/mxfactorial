# requires include shared.mk in $APP_NAME/makefile
MIGRATIONS_DIR=$(RELATIVE_PROJECT_ROOT_PATH)/migrations

start:
	@$(MAKE) get-secrets ENV=local
	nohup cargo watch --env-file $(ENV_FILE) -w src -w $(RELATIVE_PROJECT_ROOT_PATH)/crates -x run >> $(NOHUP_LOG) &

stop:
	$(MAKE) -C $(RELATIVE_PROJECT_ROOT_PATH) stop

start-alone:
	rm -f $(NOHUP_LOG)
	$(MAKE) -C $(MIGRATIONS_DIR) start
	$(MAKE) start
	tail -F $(NOHUP_LOG)

install:
	cargo fetch

test:
	$(MAKE) test-lint
	$(MAKE) test-unit

test-unit:
	cargo test

test-lint:
	cargo fmt -- --check
	cargo clippy -- -Dwarnings

lint:
	$(MAKE) test-lint

compile:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	cargo build \
		--manifest-path=$(SUB_PATH)/Cargo.toml
# requires include shared.mk
CARGO_BUILD_DIR=target
LAMBDA_TARGET=x86_64-unknown-linux-musl
RELEASE_DIR=$(CARGO_BUILD_DIR)/$(LAMBDA_TARGET)/release

install:
	cargo fetch

test:
	$(MAKE) test-lint
	$(MAKE) test-unit
	$(MAKE) -C '../..' test-compose-up

test-unit:
	cargo test

test-lint:
	cargo fmt -- --check
	cargo clippy -- -Dwarnings

lint:
	$(MAKE) test-lint

clean-build:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-binary.sh \
		--app-name $(APP_NAME) \
		--binary-name $(EXECUTABLE_NAME); \

compile:
	if ! command -v cross --version &> /dev/null; then cargo install cross --git https://github.com/cross-rs/cross; fi
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	cross build \
		--manifest-path=$(SUB_PATH)/Cargo.toml \
		--target $(LAMBDA_TARGET) \
		--release

compile-dev:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	cargo build \
		--manifest-path=$(SUB_PATH)/Cargo.toml

zip:
	@cp $(RELATIVE_PROJECT_ROOT_PATH)/$(RELEASE_DIR)/$(APP_NAME) $(EXECUTABLE_NAME)
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/zip-executable.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
		--executable-name $(EXECUTABLE_NAME)
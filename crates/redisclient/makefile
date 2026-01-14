RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/project.yaml
TEST_NAME?=integration_tests::

REDIS_DB=$(shell yq '.crates.redisclient.env_var.set.REDIS_DB.default' $(PROJECT_CONF))
REDIS_HOST=$(shell yq '.crates.redisclient.env_var.set.REDIS_HOST.default' $(PROJECT_CONF))
REDIS_PORT=$(shell yq '.crates.redisclient.env_var.set.REDIS_PORT.default' $(PROJECT_CONF))
REDIS_USERNAME=$(shell yq '.crates.redisclient.env_var.set.REDIS_USERNAME.default' $(PROJECT_CONF))
REDIS_PASSWORD=$(shell yq '.crates.redisclient.env_var.set.REDIS_PASSWORD.default' $(PROJECT_CONF))

test:
	cargo test

test-cache:
	@if ! docker ps | grep -q mxf-redis; then \
		$(MAKE) start-redis; \
	fi
	REDIS_DB=$(REDIS_DB) \
	REDIS_HOST=$(REDIS_HOST) \
	REDIS_PORT=$(REDIS_PORT) \
	REDIS_USERNAME=$(REDIS_USERNAME) \
	REDIS_PASSWORD=$(REDIS_PASSWORD) \
	cargo test $(TEST_NAME) --features cache_tests -- --test-threads=1

start-redis:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash scripts/manage-redis.sh --start

stop:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash scripts/manage-redis.sh --stop

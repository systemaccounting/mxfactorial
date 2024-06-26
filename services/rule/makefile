RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/rust.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/ecr-lambda.mk

RULE_PORT=$(shell yq '.services["$(APP_NAME)"].env_var.set.RULE_PORT.default' $(PROJECT_CONF))
RULE_URL=$(HOST):$(RULE_PORT)

TEST_DATA_FILE=preRuleTrItems.json
TEST_DATA_DIR=$(RELATIVE_PROJECT_ROOT_PATH)/tests/testdata
TEST_EVENT='$(shell cat $(TEST_DATA_DIR)/$(TEST_DATA_FILE))'

dev:
	@$(MAKE) start-alone

run:
	@$(MAKE) -C ../../migrations run
	@$(MAKE) get-secrets ENV=local
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
		cargo watch --env-file $(ENV_FILE) -w $(SUB_PATH)/src -w crates -x run -p $(SUB_PATH)

water:
	@REQ=$$(yq -o=json $(RELATIVE_PROJECT_ROOT_PATH)/tests/testdata/bottledWater.json); \
		curl -s -d "$$REQ" -H 'Content-Type: application/json' $(RULE_URL) \
		| yq -o=json


###################### invoke ######################

invoke-local:
	@curl -s -H 'Content-Type: application/json' -d $(TEST_EVENT) $(RULE_URL) | yq -o=json

demo:
	@printf "*** request to %s at %s\n" $(SUB_PATH) $(RULE_URL)
	@echo $(TEST_EVENT) | yq -o=json
	@printf "*** response from %s at %s\n" $(SUB_PATH) $(RULE_URL)
	@$(MAKE) invoke-local


###################### docker ######################

test-docker-availability:
	@docker version > /dev/null 2>&1; if [ $$? -ne 0 ]; then echo "\033[1;31mdocker required. start docker \033[0m"; fi

start-postgres-in-docker:
	$(MAKE) test-docker-availability
	NUM=$$(psql 'postgresql://test:test@0.0.0.0/mxfactorial' -t -c '\dt' | wc -l | tr -d ' ' > /dev/null 2>&1); \
	if [ "$$NUM" -eq 0 ]; then \
		$(MAKE) -C '../../migrations' run DB=test; \
		echo "waiting 3 seconds for postgres init before migrate"; \
		sleep 3; \
		$(MAKE) -C '../../migrations' updocker DB=test; \
	fi
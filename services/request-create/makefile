RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/rust.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/ecr-lambda.mk

REQUEST_CREATE_PORT=$(shell yq '.services["$(APP_NAME)"].env_var.set.REQUEST_CREATE_PORT.default' $(PROJECT_CONF))
REQUEST_CREATE_URL=$(HOST):$(REQUEST_CREATE_PORT)
MIGRATIONS_DIR=$(RELATIVE_PROJECT_ROOT_PATH)/migrations

TEST_DATA_FILE=transNoAppr.json
TEST_DATA_DIR=$(RELATIVE_PROJECT_ROOT_PATH)/tests/testdata
TEST_EVENT='$(shell cat $(TEST_DATA_DIR)/$(TEST_DATA_FILE))'

invoke-local:
	@curl -s -H 'Content-Type: application/json' -d $(TEST_EVENT) $(REQUEST_CREATE_URL) | yq -o=json

demo:
	@printf "*** request to %s at %s\n" $(SUB_PATH) $(REQUEST_CREATE_URL)
	@yq -o=json $(TEST_DATA_DIR)/$(TEST_DATA_FILE)
	@printf "*** response from %s at %s\n" $(SUB_PATH) $(REQUEST_CREATE_URL)
	@$(MAKE) invoke-local
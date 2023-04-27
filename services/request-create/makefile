RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/go.mk

DOCKER_URL=$(shell yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REQUEST_CREATE_URL.default' $(PROJECT_CONF))

TEST_DATA_FILE=transNoAppr.json
TEST_DATA_DIR=$(RELATIVE_PROJECT_ROOT_PATH)/pkg/testdata
TEST_EVENT='$(shell cat $(TEST_DATA_DIR)/$(TEST_DATA_FILE))'

run:
	@$(MAKE) -s test-env-file
	@$(DOCKER_ENV_VARS) \
		eval $$(cat $(ENV_FILE)) \
		go run $(CMD_DIR)

invoke-docker:
	@curl -s -d $(TEST_EVENT) $(DOCKER_URL) | yq -o=json

demo-docker:
	@printf "*** request to %s service at %s\n" $(APP_NAME) $(DOCKER_URL)
	@yq -o=json $(TEST_DATA_DIR)/$(TEST_DATA_FILE)
	@printf "*** response from %s service at %s\n" $(APP_NAME) $(DOCKER_URL)
	@$(MAKE) invoke-docker
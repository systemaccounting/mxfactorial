RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/go.mk

DOCKER_URL=$(shell yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REQUEST_APPROVE_URL.default' $(PROJECT_CONF))

TEST_ACCOUNT=JacobWebb
TEST_ROLE=debitor
TEST_AUTH_ACCOUNT=$(TEST_ACCOUNT)
TEST_ID=3
TEST_EVENT='{"auth_account":"$(TEST_AUTH_ACCOUNT)","id":"$(TEST_ID)","account_name":"$(TEST_ACCOUNT)","account_role":"$(TEST_ROLE)"}'

run:
	@$(MAKE) -s test-env-file
	@$(DOCKER_ENV_VARS) \
		TEST_EVENT=$(TEST_EVENT) \
		eval $$(cat $(ENV_FILE)) \
		go run $(CMD_DIR)

invoke-docker:
	@curl -s -d $(TEST_EVENT) $(DOCKER_URL) | yq -o=json

demo-docker:
	@printf "*** request to %s service at %s\n" $(APP_NAME) $(DOCKER_URL)
	@echo $(TEST_EVENT) | yq -o=json
	@printf "*** response from %s service at %s\n" $(APP_NAME) $(DOCKER_URL)
	@$(MAKE) invoke-docker
RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/rust.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/ecr-lambda.mk

REQUEST_APPROVE_PORT=$(shell yq '.services["$(APP_NAME)"].env_var.set.REQUEST_APPROVE_PORT.default' $(PROJECT_CONF))
REQUEST_APPROVE_URL=$(HOST):$(REQUEST_APPROVE_PORT)

TEST_ACCOUNT=JacobWebb
TEST_ROLE=debitor
TEST_AUTH_ACCOUNT=$(TEST_ACCOUNT)
TEST_ID=3
TEST_EVENT='{"auth_account":"$(TEST_AUTH_ACCOUNT)","id":"$(TEST_ID)","account_name":"$(TEST_ACCOUNT)","account_role":"$(TEST_ROLE)"}'

invoke-local:
	@curl -s -H 'Content-Type: application/json' -d $(TEST_EVENT) $(REQUEST_APPROVE_URL) | yq -o=json

demo:
	@printf "*** request to %s at %s\n" $(SUB_PATH) $(REQUEST_APPROVE_URL)
	@echo $(TEST_EVENT) | yq -o=json
	@printf "*** response from %s at %s\n" $(SUB_PATH) $(REQUEST_APPROVE_URL)
	@$(MAKE) invoke-local
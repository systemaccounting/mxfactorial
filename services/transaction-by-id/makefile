RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/rust.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/ecr-lambda.mk

TRANSACTION_BY_ID_PORT=$(shell yq '.services["$(APP_NAME)"].env_var.set.TRANSACTION_BY_ID_PORT.default' $(PROJECT_CONF))
TRANSACTION_BY_ID_URL=$(HOST):$(TRANSACTION_BY_ID_PORT)

TEST_ACCOUNT=JoeCarter
TEST_AUTH_ACCOUNT=$(TEST_ACCOUNT)
TEST_TRANSACTION_ID=2
TEST_EVENT='{"auth_account":"$(TEST_AUTH_ACCOUNT)","account_name":"$(TEST_AUTH_ACCOUNT)","id":"$(TEST_TRANSACTION_ID)"}'
TEST_SENDER_ACCOUNT=$(TEST_ACCOUNT)

invoke-local:
	@curl -s -H 'Content-Type: application/json' -d $(TEST_EVENT) $(TRANSACTION_BY_ID_URL) | yq -o=json

demo:
	@printf "*** request to %s at %s\n" $(SUB_PATH) $(TRANSACTION_BY_ID_URL)
	@echo $(TEST_EVENT) | yq -o=json
	@printf "*** response from %s at %s\n" $(SUB_PATH) $(TRANSACTION_BY_ID_URL)
	@$(MAKE) invoke-local
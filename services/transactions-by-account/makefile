RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/rust.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/ecr-lambda.mk

TRANSACTIONS_BY_ACCOUNT_PORT=$(shell yq '.services["$(APP_NAME)"].env_var.set.TRANSACTIONS_BY_ACCOUNT_PORT.default' $(PROJECT_CONF))
TRANSACTIONS_BY_ACCOUNT_URL=$(HOST):$(TRANSACTIONS_BY_ACCOUNT_PORT)

TEST_ACCOUNT=JoeCarter
TEST_AUTH_ACCOUNT=$(TEST_ACCOUNT)
TEST_EVENT='{"auth_account":"$(TEST_AUTH_ACCOUNT)","account_name":"$(TEST_ACCOUNT)"}'
TEST_SENDER_ACCOUNT=$(TEST_ACCOUNT)
RETURN_RECORD_LIMIT=2

invoke-local:
	@curl -s -H 'Content-Type: application/json' -d $(TEST_EVENT) $(TRANSACTIONS_BY_ACCOUNT_URL) | yq -o=json

demo:
	@printf "*** request to %s at %s\n" $(SUB_PATH) $(TRANSACTIONS_BY_ACCOUNT_URL)
	@echo $(TEST_EVENT) | yq -o=json
	@printf "*** response from %s at %s\n" $(SUB_PATH) $(TRANSACTIONS_BY_ACCOUNT_URL)
	@$(MAKE) invoke-local
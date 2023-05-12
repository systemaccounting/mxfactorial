RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/go.mk

TRANSACTION_BY_ID_PORT=$(shell yq '.services["$(APP_NAME)"].env_var.set.TRANSACTION_BY_ID_PORT.default' $(PROJECT_CONF))
TRANSACTION_BY_ID_URL=$(HOST):$(TRANSACTION_BY_ID_PORT)

TEST_ACCOUNT=JoeCarter
TEST_AUTH_ACCOUNT=$(TEST_ACCOUNT)
TEST_TRANSACTION_ID=2
TEST_EVENT='{"auth_account":"$(TEST_AUTH_ACCOUNT)","id":"$(TEST_TRANSACTION_ID)"}'
TEST_SENDER_ACCOUNT=$(TEST_ACCOUNT)

run:
	@$(DOCKER_ENV_VARS) \
		TEST_EVENT=$(TEST_EVENT) \
		go run ./cmd/main.go

invoke-docker:
	@curl -s -d $(TEST_EVENT) $(TRANSACTION_BY_ID_URL) | yq -o=json

demo-docker:
	@printf "*** request to %s service at %s\n" $(APP_NAME) $(TRANSACTION_BY_ID_URL)
	@echo $(TEST_EVENT) | yq -o=json
	@printf "*** response from %s service at %s\n" $(APP_NAME) $(TRANSACTION_BY_ID_URL)
	@$(MAKE) invoke-docker
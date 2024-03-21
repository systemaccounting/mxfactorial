RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/rust.mk

REQUEST_BY_ID_PORT=$(shell yq '.services["$(APP_NAME)"].env_var.set.REQUEST_BY_ID_PORT.default' $(PROJECT_CONF))
REQUEST_BY_ID_URL=$(HOST):$(REQUEST_BY_ID_PORT)

TEST_ACCOUNT=JacobWebb
TEST_AUTH_ACCOUNT=$(TEST_ACCOUNT)
TEST_TRANSACTION_ID=1
TEST_EVENT='{"auth_account":"$(TEST_AUTH_ACCOUNT)","account_name":"$(TEST_AUTH_ACCOUNT)","id":"$(TEST_TRANSACTION_ID)"}'
TEST_SENDER_ACCOUNT=$(TEST_ACCOUNT)

start:
	@$(MAKE) get-secrets ENV=local
	nohup cargo watch --env-file $(ENV_FILE) -w src -w $(RELATIVE_PROJECT_ROOT_PATH)/crates -x run >> $(NOHUP_LOG) &

start-alone:
	rm -f $(NOHUP_LOG)
	$(MAKE) -C $(MIGRATIONS_DIR) run
	$(MAKE) start
	tail -F $(NOHUP_LOG)

stop:
	$(MAKE) -C $(RELATIVE_PROJECT_ROOT_PATH) stop

invoke-local:
	@curl -s -H 'Content-Type: application/json' -d $(TEST_EVENT) $(REQUEST_BY_ID_URL) | yq -o=json

demo:
	@printf "*** request to %s at %s\n" $(SUB_PATH) $(REQUEST_BY_ID_URL)
	@echo $(TEST_EVENT) | yq -o=json
	@printf "*** response from %s at %s\n" $(SUB_PATH) $(REQUEST_BY_ID_URL)
	@$(MAKE) invoke-local
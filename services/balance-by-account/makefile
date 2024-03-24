RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/rust.mk

BALANCE_BY_ACCOUNT_PORT=$(shell yq '.services["$(APP_NAME)"].env_var.set.BALANCE_BY_ACCOUNT_PORT.default' $(PROJECT_CONF))
BALANCE_BY_ACCOUNT_URL=$(HOST):$(BALANCE_BY_ACCOUNT_PORT)

TEST_ACCOUNT=JacobWebb
TEST_AUTH_ACCOUNT=$(TEST_ACCOUNT)
TEST_EVENT='{"auth_account":"$(TEST_AUTH_ACCOUNT)","account_name":"$(TEST_ACCOUNT)"}'
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
	@curl -s -H 'Content-Type: application/json' -d $(TEST_EVENT) $(BALANCE_BY_ACCOUNT_URL)

demo:
	@printf "*** request to %s at %s\n" $(SUB_PATH) $(BALANCE_BY_ACCOUNT_URL)
	@echo $(TEST_EVENT) | yq -o=json
	@printf "*** response from %s at %s\n" $(SUB_PATH) $(BALANCE_BY_ACCOUNT_URL)
	@$(MAKE) invoke-local
	@printf "\n\n\e[33m*** OBSERVE the following post-transaction conservation test ***\e[0m\n"
	@printf "\ninitial balances: %s\n\n" 1000
	@printf "GroceryStore new balance: %s\n" $$(curl -s -d '{"auth_account":"GroceryStore","account_name":"GroceryStore"}' $(BALANCE_BY_ACCOUNT_URL))
	@printf "StateOfCalifornia new balance: %s\n" $$(curl -s -d '{"auth_account":"StateOfCalifornia","account_name":"StateOfCalifornia"}' $(BALANCE_BY_ACCOUNT_URL))
	@printf "JacobWebb new balance: %s\n" $$(curl -s -d $(TEST_EVENT) $(BALANCE_BY_ACCOUNT_URL))
	@GS=$$(curl -s -d '{"auth_account":"GroceryStore","account_name":"GroceryStore"}' $(BALANCE_BY_ACCOUNT_URL)); \
		SC=$$(curl -s -d '{"auth_account":"StateOfCalifornia","account_name":"StateOfCalifornia"}' $(BALANCE_BY_ACCOUNT_URL)); \
		JW=$$(curl -s -d $(TEST_EVENT) $(BALANCE_BY_ACCOUNT_URL)); \
		printf "\nconservation test: (%s - 1000) + (%s - 1000) + (%s - 1000) = %s\n" "$$GS" "$$SC" "$$JW" "$$(echo "$$GS + $$SC + $$JW - 3000" | bc)"
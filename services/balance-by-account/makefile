RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/rust.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/ecr-lambda.mk

BALANCE_BY_ACCOUNT_PORT=$(shell yq '.services["$(APP_NAME)"].env_var.set.BALANCE_BY_ACCOUNT_PORT.default' $(PROJECT_CONF))
BALANCE_BY_ACCOUNT_URL=$(HOST):$(BALANCE_BY_ACCOUNT_PORT)

JSON_HEADER="-H 'Content-Type: application/json'"
define TEST_EVENT
	'{"auth_account":"$(1)","account_name":"$(1)"}'
endef

invoke-local:
	@curl -s "$(JSON_HEADER)" -d $(call TEST_EVENT,JacobWebb) $(BALANCE_BY_ACCOUNT_URL)

demo:
	@printf "*** request to %s at %s\n" $(SUB_PATH) $(BALANCE_BY_ACCOUNT_URL)
	@echo $(call TEST_EVENT,JacobWebb) | yq -o=json
	@printf "*** response from %s at %s\n" $(SUB_PATH) $(BALANCE_BY_ACCOUNT_URL)
	@$(MAKE) invoke-local
	@printf "\n\n\e[33m*** OBSERVE the following post-transaction conservation test ***\e[0m\n"
	@printf "\ninitial balances: %s\n\n" 1000
	@printf "GroceryStore new balance: %s\n" $$(curl -s "$(JSON_HEADER)" -d $(call TEST_EVENT,GroceryStore) $(BALANCE_BY_ACCOUNT_URL))
	@printf "StateOfCalifornia new balance: %s\n" $$(curl -s "$(JSON_HEADER)" -d $(call TEST_EVENT,StateOfCalifornia) $(BALANCE_BY_ACCOUNT_URL))
	@printf "JacobWebb new balance: %s\n" $$(curl -s "$(JSON_HEADER)" -d $(call TEST_EVENT,JacobWebb) $(BALANCE_BY_ACCOUNT_URL))
	@GS=$$(curl -s "$(JSON_HEADER)" -d $(call TEST_EVENT,GroceryStore) $(BALANCE_BY_ACCOUNT_URL)); \
		SC=$$(curl -s "$(JSON_HEADER)" -d $(call TEST_EVENT,StateOfCalifornia) $(BALANCE_BY_ACCOUNT_URL)); \
		JW=$$(curl -s "$(JSON_HEADER)" -d $(call TEST_EVENT,JacobWebb) $(BALANCE_BY_ACCOUNT_URL)); \
		printf "\nconservation test: (%s - 1000) + (%s - 1000) + (%s - 1000) = %s\n" "$$GS" "$$SC" "$$JW" "$$(echo "$$GS + $$SC + $$JW - 3000" | bc)"
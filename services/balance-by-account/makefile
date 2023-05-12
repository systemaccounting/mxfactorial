RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/go.mk

BALANCE_BY_ACCOUNT_PORT=$(shell yq '.services["$(APP_NAME)"].env_var.set.BALANCE_BY_ACCOUNT_PORT.default' $(PROJECT_CONF))
BALANCE_BY_ACCOUNT_URL=$(HOST):$(BALANCE_BY_ACCOUNT_PORT)

TEST_ACCOUNT=JacobWebb
TEST_AUTH_ACCOUNT=$(TEST_ACCOUNT)
TEST_EVENT='{"auth_account":"$(TEST_AUTH_ACCOUNT)","account_name":"$(TEST_ACCOUNT)"}'
TEST_SENDER_ACCOUNT=$(TEST_ACCOUNT)

run:
	@$(DOCKER_ENV_VARS) \
		TEST_EVENT=$(TEST_EVENT) \
		go run ./cmd/main.go

invoke-docker:
	@curl -s -d $(TEST_EVENT) $(BALANCE_BY_ACCOUNT_URL)

demo-docker:
	@printf "*** request to %s service at %s\n" $(APP_NAME) $(BALANCE_BY_ACCOUNT_URL)
	@echo $(TEST_EVENT) | yq -o=json
	@printf "*** response from %s service at %s\n" $(APP_NAME) $(BALANCE_BY_ACCOUNT_URL)
	@$(MAKE) invoke-docker
	@printf "\n\n\e[33m*** OBSERVE the following post-transaction conservation test ***\e[0m\n"
	@printf "\ninitial balances: %s\n\n" 1000
	@printf "GroceryStore new balance: %s\n" $$(curl -s -d '{"auth_account":"GroceryStore","account_name":"GroceryStore"}' $(BALANCE_BY_ACCOUNT_URL))
	@printf "StateOfCalifornia new balance: %s\n" $$(curl -s -d '{"auth_account":"StateOfCalifornia","account_name":"StateOfCalifornia"}' $(BALANCE_BY_ACCOUNT_URL))
	@printf "JacobWebb new balance: %s\n" $$(curl -s -d $(TEST_EVENT) $(BALANCE_BY_ACCOUNT_URL))
	@GS=$$(curl -s -d '{"auth_account":"GroceryStore","account_name":"GroceryStore"}' $(BALANCE_BY_ACCOUNT_URL)); \
		SC=$$(curl -s -d '{"auth_account":"StateOfCalifornia","account_name":"StateOfCalifornia"}' $(BALANCE_BY_ACCOUNT_URL)); \
		JW=$$(curl -s -d $(TEST_EVENT) $(BALANCE_BY_ACCOUNT_URL)); \
		printf "\nconservation test: (%s - 1000) + (%s - 1000) + (%s - 1000) = %s\n" "$$GS" "$$SC" "$$JW" "$$(echo "$$GS + $$SC + $$JW - 3000" | bc)"
RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/go.mk

test-username-arg:
ifndef ACCT
		$(error trailing ACCT assignment missing, e.g. ACCT=SomeAccount)
endif

test-password-arg:
ifndef PASS
		$(error trailing PASS assignment missing, e.g. PASS=SomeSecret)
endif

test-ids-arg:
ifndef IDS
		$(error trailing IDS assignment missing, e.g. IDS=2,7,12)
endif

run:
	@$(MAKE) -s test-env-file
	@$(DOCKER_ENV_VARS) \
		TEST_EVENT=$(TEST_EVENT) \
		eval $$(cat $(ENV_FILE)) \
		go run $(CMD_DIR)

save-id-token:
	@$(MAKE) -s test-username-arg
	@$(MAKE) -s test-password-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/save-id-token.sh \
		--dir-path $(SUB_PATH) \
		--username $(ACCT) \
		--password $(PASS) \
		--region $(REGION)

get:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/get-notifications.sh \
		--dir-path $(SUB_PATH)

clear:
	@$(MAKE) -s test-ids-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clear-notifications.sh \
		--dir-path $(SUB_PATH) \
		--ids '$(IDS)'
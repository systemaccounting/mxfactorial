RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/go.mk
BRANCH := develop

run:
	@$(MAKE) -s test-env-file
	@eval $$(cat $(ENV_FILE)) \
		go run $(CMD_DIR)

reset-local:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/migrate.sh \
		--db_type test \
		--branch $(BRANCH) \
		--command reset
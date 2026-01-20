RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/ecr-lambda.mk

###################### rds migrate commands ######################

resetrds:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash scripts/go-migrate-rds.sh --env dev --cmd reset

downrds:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash scripts/go-migrate-rds.sh --env dev --cmd down

testrds:
	@$(MAKE) resetrds
	@$(MAKE) downrds

uprds:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash scripts/go-migrate-rds.sh --env dev --cmd up

droprds:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash scripts/go-migrate-rds.sh --env dev --cmd drop
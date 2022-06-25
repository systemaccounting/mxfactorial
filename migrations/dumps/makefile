RELATIVE_PROJECT_ROOT_PATH=../..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
TESTSEED_DUMP_PATH=$(shell jq -r '.postgres.testseed_dump_path' $(PROJECT_CONF))

dump-testseed:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/dump-db.sh --path $(TESTSEED_DUMP_PATH)

restore-testseed:
	$(MAKE) -C '..' downdocker DB=test # drops functions
	$(MAKE) -C '..' dropdocker DB=test # drops migration tables
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/restore-db.sh --path $(TESTSEED_DUMP_PATH)
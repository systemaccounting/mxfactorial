RELATIVE_PROJECT_ROOT_PATH=../..

dump-testseed:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/dump-db.sh

restore-testseed:
	$(MAKE) -C '..' dropdocker DB=test
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/restore-db.sh

dump-rds-testseed:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/dump-db.sh --rds

restore-rds-testseed:
	$(MAKE) -C '..' droprds DB=test
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/restore-db.sh --rds
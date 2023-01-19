RELATIVE_PROJECT_ROOT_PATH=../..

dump-testseed:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/dump-db.sh

restore-testseed:
	$(MAKE) -C '..' downdocker DB=test # drops functions
	$(MAKE) -C '..' dropdocker DB=test # drops migration tables
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/restore-db.sh

dump-rds-testseed:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/dump-db.sh --rds

restore-rds-testseed:
	$(MAKE) -C '..' downrds DB=test # drops functions
	$(MAKE) -C '..' droprds DB=test # drops migration tables
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/restore-db.sh --rds
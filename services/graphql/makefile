RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/rust.mk

start:
	@$(MAKE) get-secrets ENV=local
	nohup cargo watch --env-file $(ENV_FILE) -w src -w $(RELATIVE_PROJECT_ROOT_PATH)/crates -x run >> $(NOHUP_LOG) &

start-alone:
	$(MAKE) start
	tail -F $(NOHUP_LOG)

stop:
	$(MAKE) -C $(RELATIVE_PROJECT_ROOT_PATH) stop

open:
	open $(GRAPHQL_URI)/

openapi:
	$(MAKE) -s test-env-file
	eval $$(cat .env); open $$GRAPHQL_URI
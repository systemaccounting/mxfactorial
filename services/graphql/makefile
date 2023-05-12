RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/go.mk
RUN=$(CMD_DIR)/server.go
GRAPHQL_PORT=$(shell yq '.services["$(APP_NAME)"].env_var.set.GRAPHQL_PORT.default' $(PROJECT_CONF))
GRAPHQL_URI=$(HOST):$(GRAPHQL_PORT)

gen:
	go generate ./...

run:
	$(MAKE) -s test-env-file
	eval $$(cat .env) go run $(RUN)

open:
	open $(GRAPHQL_URI)/

openapi:
	$(MAKE) -s test-env-file
	eval $$(cat .env); open $$GRAPHQL_URI

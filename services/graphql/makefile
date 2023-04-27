RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/go.mk

gen:
	go generate ./...

run:
	$(MAKE) -s test-env-file
	eval $$(cat .env) go run ./server.go

open:
	open http://localhost:8080/

openapi:
	$(MAKE) -s test-env-file
	eval $$(cat .env); open $$GRAPHQL_URI

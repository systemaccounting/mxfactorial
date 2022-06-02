PKG_NAME=request
RELATIVE_PROJECT_ROOT_PATH=../..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)

test:
	go test -race -covermode=atomic -coverprofile=coverage.out

test-dependents:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/test-dependents.sh \
		--app-or-pkg-name $(PKG_NAME)

set-pending-tests:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/set-pending-tests.sh \
		--app-or-pkg-name $(PKG_NAME) \
		--sha $$GITHUB_SHA \
		--region $$AWS_REGION \
		--env $$ENVIRONMENT
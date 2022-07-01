PKG_NAME=tools
RELATIVE_PROJECT_ROOT_PATH=../../..

mock:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/mock-go-ifaces.sh \
		--app-or-pkg-name $(PKG_NAME)

test:
	go test -race -covermode=atomic -coverprofile=coverage.out

install:
	go install github.com/golang/mock/mockgen@latest

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
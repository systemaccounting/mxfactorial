PKG_NAME=apigwma
RELATIVE_PROJECT_ROOT_PATH=../../../..

test:
	go test -v -race -covermode=atomic -coverprofile=coverage.out

mock:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/mock-go-ifaces.sh \
		--app-or-pkg-name $(PKG_NAME)

install:
	go install github.com/golang/mock/mockgen@latest
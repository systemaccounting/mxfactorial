RELATIVE_PROJECT_ROOT_PATH=../../..
PKG_NAME=lambdapg

mock:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/mock-go-ifaces.sh \
		--app-or-pkg-name $(PKG_NAME)

.PHONY: mock
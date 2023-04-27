# requires include shared.mk

APP_CONF_PATH=$(shell cd $(RELATIVE_PROJECT_ROOT_PATH); . ./scripts/list-conf-paths.sh --type app | grep --color=never "$(APP_NAME)")
CMD_DIR=$(CURDIR)/$(shell yq '$(APP_CONF_PATH).build_src_path' $(PROJECT_CONF))

install:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/download-go-mod.sh

clean-build:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-binary.sh \
		--app-name $(APP_NAME) \
		--binary-name $(EXECUTABLE_NAME)

compile:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/compile-go-linux.sh \
		--app-name $(APP_NAME)
zip:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/zip-executable.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
		--executable-name $(EXECUTABLE_NAME)
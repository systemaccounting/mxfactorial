RELATIVE_PROJECT_ROOT_PATH=..
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/ecr-lambda.mk
PROJECT_CONF_FILE_NAME=project.yaml
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
BUILD_DIR=$(CURDIR)/build
DEPS_DIR=$(CURDIR)/node_modules
ENV_FILE_NAME=$(shell yq '.env_var.set.ENV_FILE_NAME.default' $(PROJECT_CONF))
ENV_FILE=$(CURDIR)/$(ENV_FILE_NAME)
NOHUP_LOG=$(RELATIVE_PROJECT_ROOT_PATH)/$(shell yq '.env_var.set.NOHUP_LOG.default' $(PROJECT_CONF))
GITHUB_ORG=$(shell yq '.[".github"].env_var.set.GITHUB_ORG.default' $(PROJECT_CONF))
GITHUB_REPO_NAME=$(shell yq '.[".github"].env_var.set.GITHUB_REPO_NAME.default' $(PROJECT_CONF))
GITHUB_REGISTRY=$(shell yq '.[".github"].workflows.env_var.set.GITHUB_REGISTRY.default' $(PROJECT_CONF))
CONTAINER_REGISTRY=$(GITHUB_REGISTRY)/$(GITHUB_ORG)/$(GITHUB_REPO_NAME)/$(APP_NAME)
PUBLIC_PREFIX_VARS=$(shell yq '.client.env_var.set.PUBLIC_PREFIX_VARS.default | join(" ")' $(PROJECT_CONF))

dev:
	@$(MAKE) start

start:
	@$(MAKE) install
	@nohup npm run dev >> $(NOHUP_LOG) &

run:
	@$(MAKE) install
	npm run dev

preview:
	npm run preview

###################### build ######################

.PHONY: build
build:
	@$(MAKE) clean
	@$(MAKE) install
	npm run build

# recipe avoids https://github.com/evanw/esbuild/issues/1819#issuecomment-1018771557
install:
	@if [ -d node_modules ]; then \
		PLATFORM="$$(echo `uname -s` | tr '[:upper:]' '[:lower:]')"; \
		if [ "$$(npm list --depth=2 | grep -e "─ @esbuild/$$PLATFORM" | wc -l | xargs)" -eq 0 ]; then \
			rm -rf node_modules; \
		fi; \
	fi
	if ! [ -d node_modules ]; then npm install; fi

prefix-env-vars:
	@for var in $$(echo $(PUBLIC_PREFIX_VARS)); do \
		if [[ $$(uname -s) == 'Darwin' ]]; then \
			sed -i '' "s/^$${var}=/PUBLIC_$${var}=/g" $(ENV_FILE); \
		else \
			sed -i "s/^$${var}=/PUBLIC_$${var}=/g" $(ENV_FILE); \
		fi; \
	done


###################### test ######################

install-sys-deps:
	npx playwright install-deps

install-browsers:
	npx playwright install

test:
	if ! [ -d node_modules ]; then npm install; fi
	@$(MAKE) install-browsers
	@$(MAKE) -C .. reset-db
	npm run test

test-ci:
	if ! [ -d node_modules ]; then npm install; fi
	@$(MAKE) -s install-sys-deps
	@$(MAKE) -s install-browsers
	@$(MAKE) -s get-secrets ENV=local
	npm run test-ci

###################### clean ######################

clean-deps:
	@rm -rf $(DEPS_DIR)

clean-build:
	@rm -rf $(BUILD_DIR)

clean:
	@$(MAKE) clean-env
	@$(MAKE) clean-deps
	@$(MAKE) clean-build

###################### secrets ######################

up:
	docker compose -f ../docker/services.yaml up -d client --renew-anon-volumes --force-recreate --build

down:
	docker compose -f ../docker/services.yaml down

###################### k8s ######################

build-k8s:
	cd $(RELATIVE_PROJECT_ROOT_PATH); \
	docker build -f ./docker/client.Dockerfile -t $(CONTAINER_REGISTRY):latest --provenance=false .

push-k8s:
	docker push $(CONTAINER_REGISTRY):latest

###################### utils ######################

date:
	@NO_COLOR=1 node -e 'console.log(new Date());'

###################### make ######################

test-env-arg:
ifndef ENV
	$(info trailing ENV assignment missing, e.g. make env ENV=dev|stg|prod, defaulting to 'local')
ENV=local
endif
SHELL:=/bin/bash
APP_NAME=$(shell basename $(CURDIR))
RELATIVE_PROJECT_ROOT_PATH=..
PROJECT_CONF_FILE_NAME=project.yaml
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
CLIENT_ORIGIN_BUCKET_PREFIX=$(shell yq '.infra.terraform.aws.modules["project-storage"].env_var.set.CLIENT_ORIGIN_BUCKET_PREFIX.default' $(PROJECT_CONF))
ENV_ID=$(shell (cd $(RELATIVE_PROJECT_ROOT_PATH); ENV=$(ENV) PROJECT_CONF=$(PROJECT_CONF_FILE_NAME) . ./scripts/print-env-id.sh))
ORIGIN_BUCKET=$(CLIENT_ORIGIN_BUCKET_PREFIX)-$(ENV_ID)-$(ENV)
ENABLE_API_AUTH=$(shell yq '.infra.terraform.aws.modules.environment.env_var.set.ENABLE_API_AUTH.default' $(PROJECT_CONF))
SSM_VERSION=$(shell yq '.infra.terraform.aws.modules.environment.env_var.set.SSM_VERSION.default' $(PROJECT_CONF))
CLOUDFRONT_QUERY=Invalidation.{Status:Status,CreateTime:CreateTime}
BUILD_DIR=$(CURDIR)/build
DEPS_DIR=$(CURDIR)/node_modules
REGION=$(shell yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $(PROJECT_CONF))
ENV_FILE_NAME=$(shell yq '.env_var.set.ENV_FILE_NAME.default' $(PROJECT_CONF))
ENV_FILE=$(CURDIR)/$(ENV_FILE_NAME)
NOHUP_LOG=$(RELATIVE_PROJECT_ROOT_PATH)/$(shell yq '.env_var.set.NOHUP_LOG.default' $(PROJECT_CONF))
GITHUB_ORG=$(shell yq '.[".github"].env_var.set.GITHUB_ORG.default' $(PROJECT_CONF))
GITHUB_REPO_NAME=$(shell yq '.[".github"].env_var.set.GITHUB_REPO_NAME.default' $(PROJECT_CONF))
GITHUB_REGISTRY=$(shell yq '.[".github"].workflows.env_var.set.GITHUB_REGISTRY.default' $(PROJECT_CONF))
CONTAINER_REGISTRY=$(GITHUB_REGISTRY)/$(GITHUB_ORG)/$(GITHUB_REPO_NAME)/$(APP_NAME)

dev:
	@$(MAKE) start

start:
	@$(MAKE) get-secrets ENV=local
	@$(MAKE) install
	nohup npm run dev >> $(NOHUP_LOG) &

run:
	@$(MAKE) get-secrets ENV=local
	@$(MAKE) install
	npm run dev

preview:
	npm run preview

###################### build ######################

.PHONY: build
build:
	npm run build
	$(MAKE) build-artifact

build-artifact:
	rm -rf $(BUILD_DIR)
	mkdir $(BUILD_DIR)
	cp .svelte-kit/output/prerendered/pages/index.html $(BUILD_DIR)
	cp -a .svelte-kit/output/client/* $(BUILD_DIR)

build-env:
	@$(MAKE) -s test-env-arg
ifeq (local,$(ENV))
	@$(MAKE) get-secrets ENV=local
else
	@$(MAKE) get-secrets ENV=dev
endif
	$(MAKE) build

###################### dependencies ######################

# recipe avoids https://github.com/evanw/esbuild/issues/1819#issuecomment-1018771557
install:
	@if [ -d node_modules ]; then \
		PLATFORM="$$(echo `uname -s` | tr '[:upper:]' '[:lower:]')"; \
		if [ "$$(npm list --depth=2 | grep -e "─ @esbuild/$$PLATFORM" | wc -l | xargs)" -eq 0 ]; then \
			rm -rf node_modules; \
		fi; \
	fi
	if ! [ -d node_modules ]; then npm install; fi

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
	@$(MAKE) -s install-browsers
	@$(MAKE) -s get-secrets ENV=local
	npm run test-ci

###################### clean ######################

clean-env:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-env.sh \
		--app-name $(APP_NAME)

clean-deps:
	@rm -rf $(DEPS_DIR)

clean:
	@$(MAKE) clean-env
	@$(MAKE) clean-deps
	@rm -rf .svelte-kit build

###################### secrets ######################

env:
	@$(MAKE) get-secrets

get-secrets:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/create-env-file.sh \
		--app-name $(APP_NAME) \
		--env $(ENV); \
	bash scripts/encode-client-env.sh

###################### deploy ######################

initial-deploy:
	@echo '*** skipping client initial-deploy. redeploy after environment build'

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) install
	$(MAKE) get-secrets
	$(MAKE) build
	$(MAKE) sync
ifeq (true,$(shell yq '.scripts.env_var.set.BUILD_CACHE.default' $(PROJECT_CONF)))
	$(MAKE) empty-cache
endif

sync:
	@$(MAKE) -s test-env-arg
	aws s3 sync $(BUILD_DIR)/ s3://$(ORIGIN_BUCKET) --delete

empty-cache:
	@$(MAKE) -s test-env-arg
	@CACHE_ID=$$(aws cloudfront list-distributions --output text \
		--query 'sort_by(DistributionList.Items[?DefaultCacheBehavior.TargetOriginId==`$(ORIGIN_BUCKET)`], &LastModifiedTime)[-1].Id'); \
	aws configure set preview.cloudfront true; \
	echo 'emptying cache'; \
	aws cloudfront create-invalidation --distribution-id $$CACHE_ID --paths "/*" --query '$(CLOUDFRONT_QUERY)'
ifeq ($(ENV), prod)
	@WWW_CACHE_ID=$$(aws cloudfront list-distributions --output text \
	--query 'sort_by(DistributionList.Items[?DefaultCacheBehavior.TargetOriginId==`www-$(ORIGIN_BUCKET)`], &LastModifiedTime)[-1].Id'); \
	echo 'emptying www cache'; \
	aws cloudfront create-invalidation --distribution-id $$WWW_CACHE_ID --paths "/*" --query '$(CLOUDFRONT_QUERY)'
endif

###################### docker ######################

up:
	docker compose -f ../docker/compose.yaml up -d client --renew-anon-volumes --force-recreate --build

down:
	docker compose -f ../docker/compose.yaml down

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
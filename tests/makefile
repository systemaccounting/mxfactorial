APP_NAME=$(shell basename $(CURDIR))
RELATIVE_PROJECT_ROOT_PATH=..
PROJECT_CONF_FILE_NAME=project.yaml
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
ENV_FILE_NAME=$(shell yq '.env_var.set.ENV_FILE_NAME.default' $(PROJECT_CONF))
ENV_FILE=$(CURDIR)/$(ENV_FILE_NAME)

test-local:
	@$(MAKE) get-secrets ENV=local
	@$(MAKE) -S -C ../migrations reset
	@until docker exec mxf-postgres-1 pg_isready -U postgres; do sleep 1; done
	cargo test --features integration_tests -- --test-threads=1

test-docker:
	@$(MAKE) -C ../ compose-up
	@$(MAKE) test-local

test-cloud:
	@$(MAKE) -s test-env-arg
	@$(MAKE) --no-print-directory -C ../migrations resetrds ENV=$(ENV) DB=test
	@cd $(RELATIVE_PROJECT_ROOT_PATH); bash scripts/invoke-warm-cache.sh --env $(ENV)
	@$(MAKE) --no-print-directory -S get-secrets ENV=$(ENV)
	cargo test --features integration_tests -- --test-threads=1

test-k8s:
	(cd $(RELATIVE_PROJECT_ROOT_PATH); bash scripts/set-k8s-ports.sh)
	@$(MAKE) get-secrets ENV=local
	@until pg_isready -h localhost -p 32345; do sleep 1; done
	@$(MAKE) -S -C ../migrations resetdocker
	cargo test --features integration_tests -- --test-threads=1
	(cd $(RELATIVE_PROJECT_ROOT_PATH); bash scripts/set-k8s-ports.sh --reset)

###################### secrets ######################

test-env-arg:
ifndef ENV
	$(info trailing ENV assignment missing, e.g. make env ENV=dev|stg|prod, defaulting to 'local')
ENV=local
endif

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

clean:
	@$(MAKE) clean-env

clean-env:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-env.sh \
		--app-name $(APP_NAME)

get-secrets:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/create-env-file.sh \
		--app-name $(APP_NAME) \
		--env $(ENV)
env:
	@$(MAKE) get-secrets
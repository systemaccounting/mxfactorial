APP_NAME=$(shell basename $(CURDIR))
RELATIVE_PROJECT_ROOT_PATH=..
PROJECT_CONF_FILE_NAME=project.yaml
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
ENV_FILE_NAME=$(shell yq '.env_var.set.ENV_FILE_NAME.default' $(PROJECT_CONF))
ENV_FILE=$(CURDIR)/$(ENV_FILE_NAME)

test-local:
	@$(MAKE) get-secrets ENV=local
	@$(MAKE) -S -C ../migrations reset
	@until pg_isready -h localhost; do sleep 1; done
	@$(MAKE) -S -C ../migrations/dumps dump-testseed
	cargo test --features integration_tests -- --test-threads=1

test-docker:
	@$(MAKE) -C ../ compose-up
	@$(MAKE) test-local

test-cloud:
	@$(MAKE) -s test-env-arg
	@$(MAKE) --no-print-directory -C ../migrations resetrds ENV=$(ENV) DB=test
	@$(MAKE) --no-print-directory -C ../migrations/dumps dump-rds-testseed
	@$(MAKE) --no-print-directory -S get-secrets ENV=$(ENV)
	cargo test --features integration_tests -- --test-threads=1

###################### secrets ######################

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
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
	@$(MAKE) -s test-env-arg
	@$(MAKE) get-secrets
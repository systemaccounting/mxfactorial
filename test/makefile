PKG_NAME=test
ENV_FILE=$(CURDIR)/.env
RELATIVE_PROJECT_ROOT_PATH=..
REGION=us-east-1

install:
	npm install

.PHONY: test
test:
	@$(MAKE) -s test-env-file
	npm test

resetrds:
	$(MAKE) -C '../migrations' resetrds ENV=dev

###################### secrets ######################

clean-env:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-env.sh \
		--app-name $(PKG_NAME)

get-secrets:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/create-env.sh \
		--app-name $(PKG_NAME) \
		--env $(ENV) \
		--region $(REGION)

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

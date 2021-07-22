INVENTORY_FILE=$(CURDIR)/inventory

PARENT_DIRS=services \
migrations \
client

APP_DIRS=$(shell cat $(INVENTORY_FILE))
SIZE=$(shell wc -l < "$(INVENTORY_FILE)" | xargs)
REGION=us-east-1
ENV_FILE=$(CURDIR)/.env
ENV_VARS=CLIENT_URI \
GRAPHQL_URI

# approx 5 minutes
all:
	@$(MAKE) -s test-inv-file
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-cmd-arg
	@$(MAKE) -s test-cmd-val
	@echo "deployment inventory size: $(SIZE)"
	@$(foreach DIR,$(APP_DIRS), $(MAKE) -C $(DIR) $(CMD) ENV=$(ENV);)

.PHONY: inventory
inventory:
	@rm -f $(INVENTORY_FILE)
	@$(foreach DIR,$(PARENT_DIRS), \
		grep --include=project.json -rlw '$(DIR)' -e '"deploy": true' \
		| sed -e 's/\.\///' -e 's/\/project.json//' \
		>> $(INVENTORY_FILE);)
	@echo "project inventory size: $$(wc -l < "$(INVENTORY_FILE)" | xargs)"

size:
	@$(MAKE) -s test-inv-file
	@echo "$(SIZE)"

print:
	cat $(INVENTORY_FILE)

install:
	brew install go
	brew install node
	brew install terraform
	brew install awscli
	brew install jq
	brew install libpq
	brew link --force libpq
	npm install -g eslint
	npm install -g yarn
#	https://www.docker.com/products/docker-desktop

init:
	go mod init github.com/systemaccounting/mxfactorial


###################### secrets ######################

clean-env:
	rm -f $(ENV_FILE)

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

get-secrets:
	@$(MAKE) -s retrieve-each-secret
	@if [ ! -s $(ENV_FILE) ]; then \
		rm $(ENV_FILE); \
		echo 'no env vars required'; \
	else \
		echo 'env vars retrieved'; \
	fi

retrieve-each-secret: test-env-arg clean-env $(ENV_VARS)
$(ENV_VARS):
	ENV_VAR=$$(aws secretsmanager get-secret-value \
		--region $(REGION) \
		--secret-id $(ENV)/$@ \
		--query 'SecretString' \
		--output text); \
	echo $@=$$ENV_VAR >> $(ENV_FILE)

### arg tests
test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make all ENV=stg)
endif

test-cmd-arg:
ifndef CMD
	$(error trailing CMD assignment missing, e.g. make all CMD=initial-deploy)
endif

test-cmd-val:
ifneq ($(CMD),$(filter $(CMD),deploy initial-deploy))
	$(error trailing CMD assignment must be 'deploy' or 'initial-deploy')
endif

test-inv-file:
ifeq (,$(wildcard $(INVENTORY_FILE)))
	$(error no inventory file, run 'make inventory')
endif
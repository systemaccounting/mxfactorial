init:
	go mod init github.com/systemaccounting/mxfactorial

# first, provision environment artifact bucket in terraform (e.g. stg):
# infrastructure/terraform/aws/environments/us-east-1/certs-and-s3.tf
# then `make all ENV=stg` to push all artifacts to new stg bucket

# approx 5 minutes
INVENTORY_FILE=$(CURDIR)/inventory

PARENT_DIRS=services \
migrations \
react

APP_DIRS=$(shell cat $(INVENTORY_FILE))
SIZE=$(shell wc -l < "$(INVENTORY_FILE)" | xargs)

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
		grep --include=makefile -rlw '$(DIR)' -e 'DEPLOY_APP=true' \
		| sed -e 's/\.\///' -e 's/\/makefile//' \
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
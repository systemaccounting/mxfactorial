INVENTORY_FILE=../inventory
CURRENT_DIR=$(shell basename $(CURDIR))
APP_DIRS=$(shell cat $(INVENTORY_FILE) | awk '/^$(CURRENT_DIR)/' | sed 's/$(CURRENT_DIR)\///')
SIZE=$(shell echo "$(APP_DIRS)" | wc -w | xargs)

all:
	@$(MAKE) -s test-inv-file
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-cmd-arg
	@$(MAKE) -s test-cmd-val
	@echo "service deployment inventory size: $(SIZE)"
	@$(foreach DIR,$(APP_DIRS), $(MAKE) -C $(DIR) $(CMD) ENV=$(ENV);)

size:
	@$(MAKE) -s test-inv-file
	@echo "$(SIZE)"

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
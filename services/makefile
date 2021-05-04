test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

DIRS=auto-confirm \
graphql \
notifications-clear \
notifications-get \
notifications-send \
request-approve \
request-by-id \
request-create \
requests-by-account \
rules \
transaction-by-id \
transactions-by-account \
wss-connect

# not currently provisioned:
# internal-tools/delete-faker-accounts

initial-deploy:
	@$(MAKE) -s test-env-arg
	$(foreach DIR,$(DIRS), $(MAKE) -C $(DIR) initial-deploy ENV=$(ENV);)

deploy:
	@$(MAKE) -s test-env-arg
	$(foreach DIR,$(DIRS), $(MAKE) -C $(DIR) deploy ENV=$(ENV);)
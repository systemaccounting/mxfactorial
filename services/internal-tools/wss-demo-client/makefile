ENV_FILE=$(CURDIR)/.env
LOG_ID_TOKEN=false
REGION=us-east-1
RELATIVE_PROJECT_ROOT_PATH=../../..
DIR_PATH=services/internal-tools/wss-demo-client

ENV_VARS := CLIENT_ID \
WEBSOCKET_CLIENT_URI \
AWS_REGION

test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

test-username-arg:
ifndef ACCT
		$(error trailing ACCT assignment missing, e.g. ACCT=SomeAccount)
endif

test-password-arg:
ifndef PASS
		$(error trailing PASS assignment missing, e.g. PASS=SomeSecret)
endif

test-ids-arg:
ifndef IDS
		$(error trailing IDS assignment missing, e.g. IDS=2,7,12)
endif

getnotifications:
	eval $$(cat .env) \
		LOG_ID_TOKEN=$(LOG_ID_TOKEN) \
		ACTION=getnotifications \
		node index.js

clearnotifications:
	eval $$(cat .env) \
		LOG_ID_TOKEN=$(LOG_ID_TOKEN) \
		ACTION=clearnotifications \
		node index.js

install:
	npm install

clean-deps:
	rm -rf node_modules

clean:
	$(MAKE) clean-deps

###################### secrets ######################

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev USER=SomeUser PASS=SomeSecret')
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
	@if [ $@ = AWS_REGION ]; then \
		echo AWS_REGION=$(REGION) >> $(ENV_FILE); \
	else \
		ENV_VAR=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
		echo $@=$$ENV_VAR >> $(ENV_FILE); \
	fi

save-id-token:
	@$(MAKE) -s test-username-arg
	@$(MAKE) -s test-password-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/save-id-token.sh \
		--dir-path $(DIR_PATH) \
		--username $(ACCT) \
		--password $(PASS) \
		--region $(REGION)

clean-env:
	rm -f $(ENV_FILE)

###################### notifications ######################

get:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/get-notifications.sh \
		--dir-path $(DIR_PATH)

clear:
	@$(MAKE) -s test-ids-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clear-notifications.sh \
		--dir-path $(DIR_PATH) \
		--ids '$(IDS)'
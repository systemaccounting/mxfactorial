ENV_FILE=$(CURDIR)/.env
ACTION=getnotifications
TEST_ACCOUNT=JacobWebb
TEST_PASSWORD=$(TEST_ACCOUNT)
LOG_ID_TOKEN=false
REGION=us-east-1

ENV_VARS := CLIENT_ID \
WEBSOCKET_CLIENT_URI \
ACCOUNT \
SECRET \
AWS_REGION \
LOG_ID_TOKEN

test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

run:
	eval $$(cat .env) ACTION=$(ACTION) node index.js

install:
	yarn install

###################### secrets ######################

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
	@if [ $@ = AWS_REGION ]; then \
		echo AWS_REGION=$(REGION) >> $(ENV_FILE); \
	elif [ $@ = LOG_ID_TOKEN ]; then \
		echo LOG_ID_TOKEN=$(LOG_ID_TOKEN) >> $(ENV_FILE); \
	elif [ $@ = ACCOUNT ]; then \
		echo ACCOUNT=$(TEST_ACCOUNT) >> $(ENV_FILE); \
	elif [ $@ = SECRET ]; then \
		echo SECRET=$(TEST_PASSWORD) >> $(ENV_FILE); \
	else \
		ENV_VAR=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
		echo $@=$$ENV_VAR >> $(ENV_FILE); \
	fi

clean-env:
	rm -f $(ENV_FILE)
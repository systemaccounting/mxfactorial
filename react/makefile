APP_NAME=react
APP_TYPE=client
ARTIFACT_BUCKET=mxfactorial-react-$(ENV)
REGION=us-east-1

TEST_ACCOUNTS=TEST_ACCOUNT_01 \
TEST_ACCOUNT_02 \
TEST_ACCOUNT_03

MANUAL_ACCOUNTS=JoeSmith \
Person1 \
Person2

ENV_VARS=POOL_ID \
CLIENT_ID \
GRAPHQL_API \
ENV \
SECRET \
ACCOUNT \
AWS_REGION \
WEBSOCKET_CLIENT_URI

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

clean-deps:
	rm -rf node_modules

clean-env:
	rm -f .env

clean-artifact:
	rm -rf build

clean:
	$(MAKE) clean-deps
	$(MAKE) clean-env
	$(MAKE) clean-artifact

###################### dependencies ######################

install:
	$(MAKE) clean-deps
	yarn install

###################### secrets ######################

get-secrets: retrieve-each-secret
	@if [ ! -s $(CURDIR)/.env ]; then \
		rm $(CURDIR)/.env; \
		echo 'no env vars required'; \
	else \
		echo 'env vars retrieved'; \
	fi

retrieve-each-secret: test-env-arg clean-env $(ENV_VARS)
$(ENV_VARS):
	@if [ $@ = AWS_REGION ]; then \
		echo REACT_APP_AWS_REGION=$(REGION) >> $(CURDIR)/.env; \
	elif [ $@ = ENV ]; then \
		echo JEST_ENV=$(ENV) >> $(CURDIR)/.env; \
	elif [ $@ = ACCOUNT ]; then \
		for account in $(TEST_ACCOUNTS); do \
			echo $$account=1 >> $(CURDIR)/.env; \
		done; \
	elif [ $@ = SECRET ]; then \
		SECRET=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
		echo JEST_$@=$$SECRET >> $(CURDIR)/.env; \
	else \
		ENV_VAR=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
		echo REACT_APP_$@=$$ENV_VAR >> $(CURDIR)/.env; \
	fi

###################### start ######################

start:
	@$(MAKE) -s test-env-arg
	$(MAKE) get-secrets ENV=$(ENV)
	$(MAKE) install
	yarn start:env

###################### build and test ######################

test:
	@$(MAKE) -s test-env-arg
	$(MAKE) install
	$(MAKE) test-unit
	$(MAKE) test-e2e

test-unit:
	yarn test

test-e2e:
	@$(MAKE) -s test-env-arg
	$(MAKE) get-secrets ENV=$(ENV)
	$(MAKE) warm-up
	yarn test:e2e-public; \
	yarn test:e2e-private

e2e-now:
	yarn test:e2e-public; \
	yarn test:e2e-private

.PHONY: build
build:
	@$(MAKE) -s test-env-arg
	$(MAKE) clean-env
	$(MAKE) get-secrets ENV=$(ENV)
	yarn build:env

###################### deploy ######################

deploy:
	@$(MAKE) -s test-env-arg
	@CACHE_ID=$$(aws cloudfront list-distributions --output text \
		--query 'DistributionList.Items[?DefaultCacheBehavior.TargetOriginId==`$(ARTIFACT_BUCKET)`][].Id'); \
	aws s3 sync build/ s3://$(ARTIFACT_BUCKET) --delete; \
	aws configure set preview.cloudfront true; \
	echo 'Terminating cache'; \
	aws cloudfront create-invalidation --distribution-id $$CACHE_ID \
		--paths "/*" --query 'Invalidation.{Status:Status,CreateTime:CreateTime}'
ifeq ($(ENV), prod)
	@WWW_CACHE_ID=$$(aws cloudfront list-distributions --output text \
	--query 'DistributionList.Items[?DefaultCacheBehavior.TargetOriginId==`www-$(ARTIFACT_BUCKET)`][].Id'); \
	echo 'Terminating www cache'; \
	aws cloudfront create-invalidation --distribution-id $$WWW_CACHE_ID \
	--paths "/*" --query 'Invalidation.{Status:Status,CreateTime:CreateTime}'
endif

deploy-untested:
ifeq ($(ENV), prod)
		$(error no untested deployments to prod)
endif
	@CACHE_ID=$$(aws cloudfront list-distributions --output text \
		--query 'DistributionList.Items[?DefaultCacheBehavior.TargetOriginId==`$(ARTIFACT_BUCKET)`][].Id'); \
	aws s3 sync build/ s3://$(ARTIFACT_BUCKET) --delete; \
	aws configure set preview.cloudfront true; \
	echo 'Terminating cache'; \
	aws cloudfront create-invalidation --distribution-id $$CACHE_ID \
		--paths "/*" --query 'Invalidation.{Status:Status,CreateTime:CreateTime}'

deploy-all: deploy-layer deploy

###################### create e2e test and manual accounts ######################

create-accounts: test-env-arg get-secrets
	@[ -f .env ] && . .env; \
	for account in $(TEST_ACCOUNTS); do \
		aws cognito-idp sign-up \
			--region $(REGION) \
			--client-id $$REACT_APP_CLIENT_ID \
			--username $$account \
			--password $$JEST_SECRET; \
	done; \
	for manual_account in $(MANUAL_ACCOUNTS); do \
		aws cognito-idp sign-up \
			--region $(REGION) \
			--client-id $$REACT_APP_CLIENT_ID \
			--username $$manual_account \
			--password password; \
	done

delete-accounts: test-env-arg get-secrets
	@[ -f .env ] && . .env; \
	for account in $(TEST_ACCOUNTS); do \
		aws cognito-idp admin-delete-user \
			--region $(REGION) \
			--user-pool-id $$REACT_APP_POOL_ID \
			--username $$account; \
	done; \
	for manual_account in $(MANUAL_ACCOUNTS); do \
		aws cognito-idp admin-delete-user \
			--region $(REGION) \
			--user-pool-id $$REACT_APP_POOL_ID \
			--username $$manual_account; \
	done; \
	echo 'accounts deleted'
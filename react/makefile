DIR := ${CURDIR}
APP_NAME = react
APP_TYPE = client
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1
ENV_VARS := POOL_ID CLIENT_ID GRAPHQL_API ENV SECRET ACCOUNT AWS_REGION \
WSS_CLIENT_URL
TEST_ACCOUNTS = TEST_ACCOUNT_01 TEST_ACCOUNT_02 TEST_ACCOUNT_03
MANUAL_ACCOUNTS = JoeSmith Person1 Person2

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

clean: clean-deps clean-env clean-artifact

###################### dependencies ######################

install: clean-deps
		yarn install

###################### secrets ######################

get-secrets: retrieve-each-secret
	@if [ ! -s $(DIR)/.env ]; then \
		rm $(DIR)/.env; \
		echo 'no env vars required'; \
	else \
		echo 'env vars retrieved'; \
	fi

retrieve-each-secret: test-env-arg clean-env $(ENV_VARS)
$(ENV_VARS):
	@if [ $@ = AWS_REGION ]; then \
		echo REACT_APP_AWS_REGION=$(REGION) >> $(DIR)/.env; \
	elif [ $@ = ENV ]; then \
		echo JEST_ENV=$(ENV) >> $(DIR)/.env; \
	elif [ $@ = ACCOUNT ]; then \
		for account in $(TEST_ACCOUNTS); do \
			echo $$account=1 >> $(DIR)/.env; \
		done; \
	elif [ $@ = SECRET ]; then \
		SECRET=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
		echo JEST_$@=$$SECRET >> $(DIR)/.env; \
	else \
		ENV_VAR=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
		echo REACT_APP_$@=$$ENV_VAR >> $(DIR)/.env; \
	fi

###################### start ######################

start: get-secrets install
		yarn start:env

###################### build and test ######################

test: test-env-arg install test-unit test-e2e

test-unit:
		yarn test

test-e2e: test-env-arg get-secrets warm-up
		yarn test:e2e-public; \
		yarn test:e2e-private

e2e-now:
		yarn test:e2e-public; \
		yarn test:e2e-private

build: clean-env test-env-arg get-secrets
		yarn build:env

# create development environment
dev: build

###################### deploy ######################

deploy: test-env-arg
		@CACHE_ID=$$(aws cloudfront list-distributions --output text \
			--query 'DistributionList.Items[?DefaultCacheBehavior.TargetOriginId==`mxfactorial-react-'$(ENV)'`][].Id'); \
		aws s3 sync build/ s3://mxfactorial-react-$(ENV) --delete; \
		aws configure set preview.cloudfront true; \
		echo 'Terminating cache'; \
		aws cloudfront create-invalidation --distribution-id $$CACHE_ID \
			--paths "/*" --query 'Invalidation.{Status:Status,CreateTime:CreateTime}'
ifeq ($(ENV), prod)
		@WWW_CACHE_ID=$$(aws cloudfront list-distributions --output text \
		--query 'DistributionList.Items[?DefaultCacheBehavior.TargetOriginId==`www-mxfactorial-react-prod`][].Id'); \
		echo 'Terminating www cache'; \
		aws cloudfront create-invalidation --distribution-id $$WWW_CACHE_ID \
		--paths "/*" --query 'Invalidation.{Status:Status,CreateTime:CreateTime}'
endif

deploy-untested:
ifeq ($(ENV), prod)
		$(error no untested deployments to prod)
endif
		@CACHE_ID=$$(aws cloudfront list-distributions --output text \
			--query 'DistributionList.Items[?DefaultCacheBehavior.TargetOriginId==`mxfactorial-react-'$(ENV)'`][].Id'); \
		aws s3 sync build/ s3://mxfactorial-react-$(ENV) --delete; \
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

###################### warm up services ######################

warm-up: test-env-arg $(SERVICES_DIRS)
		@$(MAKE) -C ../services ENV=$(ENV) warm-up
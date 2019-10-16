DIR := ${CURDIR}
APP_NAME = react
APP_TYPE = client
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1
ENV_VARS := POOL_ID CLIENT_ID GRAPHQL_API ENV SECRET

.PHONY: test-env-arg
test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

.PHONY: clean-deps
clean-deps:
		rm -rf node_modules

.PHONY: clean-env
clean-env:
		rm -f .env

.PHONY: clean-artifact
clean-artifact:
		rm -rf build

.PHONY: clean clean-deps clean-env clean-artifact
clean: clean-deps clean-env clean-artifact

###################### dependencies ######################

.PHONY: install clean-deps
install: clean-deps
		yarn install

###################### secrets ######################

.PHONY: get-secrets retrieve-each-secret
get-secrets: retrieve-each-secret
	@if [ ! -s $(DIR)/.env ]; then \
		rm $(DIR)/.env; \
		echo 'no env vars required'; \
	else \
		echo 'env vars retrieved'; \
	fi

.PHONY: retrieve-each-secret test-env-arg clean-env $(ENV_VARS)
retrieve-each-secret: test-env-arg clean-env $(ENV_VARS)
$(ENV_VARS):
	@if [ $@ = AWS_REGION ]; then \
		echo REACT_APP_AWS_REGION=$(REGION) >> $(DIR)/.env; \
	elif [ $@ = ENV ]; then \
		echo JEST_ENV=$(ENV) >> $(DIR)/.env; \
	elif [ $@ = SECRET ]; then \
		echo JEST_SECRET=password >> $(DIR)/.env; \
	else \
		ENV_VAR=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
		echo REACT_APP_$@=$$ENV_VAR >> $(DIR)/.env; \
	fi

###################### start ######################

.PHONY: start install
start: install
		yarn start:env

###################### build and test ######################

.PHONY: test-env-arg test test-unit test-e2e
test: test-env-arg install test-unit test-e2e

.PHONY: test-unit
test-unit:
		yarn test

.PHONY: test-e2e test-env-arg get-secrets warm-up
test-e2e: test-env-arg get-secrets warm-up
		yarn test:e2e-public; \
		yarn test:e2e-private

.PHONY: e2e-now
e2e-now:
		yarn test:e2e-public; \
		yarn test:e2e-private

.PHONY: build clean-env test-env-arg get-secrets
build: clean-env test-env-arg get-secrets
		yarn build:env

# create development environment
.PHONY: dev build
dev: build

###################### deploy ######################

.PHONY: deploy test-env-arg
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

.PHONY: deploy-untested
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

.PHONY: deploy-all deploy-layer deploy
deploy-all: deploy-layer deploy

###################### warm up services ######################

.PHONY: warm-up test-env-arg $(SERVICES_DIRS)
warm-up: test-env-arg $(SERVICES_DIRS)
		@$(MAKE) -C ../services ENV=$(ENV) warm-up
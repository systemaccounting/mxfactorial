DIR := ${CURDIR}
APP_NAME = react
APP_TYPE = client
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1

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

.PHONY: install clean get-secrets
install: clean get-secrets
		yarn install

###################### secrets ######################

.PHONY: get-secrets test-env-arg
get-secrets: test-env-arg
		@aws secretsmanager get-secret-value --secret-id $(ENV)/$(APP_NAME)-$(APP_TYPE) \
			--query 'SecretBinary' \
			--output text \
			| base64 --decode \
			> $(DIR)/.env
		@if [ ! -s $(DIR)/.env ]; then \
			rm $(DIR)/.env; \
		fi

.PHONY: create-secrets test-env-arg
create-secrets: test-env-arg
		aws secretsmanager create-secret \
			--name $(ENV)/$(APP_NAME)-$(APP_TYPE) \
			--description 'env-cmd file fetched before testing' \
			--secret-binary file://$(DIR)/.env

.PHONY: put-secrets test-env-arg
put-secrets: test-env-arg
		aws secretsmanager put-secret-value \
			--secret-id $(ENV)/$(APP_NAME)-$(APP_TYPE) \
			--secret-binary file://$(DIR)/.env

.PHONY: test-secret test-env-arg
test-secret: test-env-arg
		@aws secretsmanager describe-secret \
			--secret-id $(ENV)/$(APP_NAME)-$(APP_TYPE) \
			> /dev/null 2>&1; \
			if [ "$$?" != 0 ]; then \
				echo "$(APP_NAME)-$(APP_TYPE) requires a remote-stored .env file to build."; \
				printf "create an .env file and store with "; \
				echo "'make create-secrets' before building."; \
				echo "exiting."; \
				exit 1; \
			fi

###################### start ######################

.PHONY: start install
start: install
		yarn start:env

###################### build and test ######################

.PHONY: test install
test: install
		yarn test --coverage

.PHONY: e2e install warm-up
e2e: install warm-up
		LOCAL_ENV=$(ENV) yarn test:e2e-public; \
		LOCAL_ENV=$(ENV) yarn test:e2e-private

.PHONY: e2e
e2e-now:
		LOCAL_ENV=$(ENV) yarn test:e2e-public; \
		LOCAL_ENV=$(ENV) yarn test:e2e-private


.PHONY: build clean-env test-env-arg get-secrets
build: clean-env test-env-arg get-secrets
		yarn build:env

# create development environment
.PHONY: dev build
dev: build

###################### deploy ######################

.PHONY: deploy
deploy:
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
		aws cloudfront create-invalidation --distribution-id $WWW_CACHE_ID \
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
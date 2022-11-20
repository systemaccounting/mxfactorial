APP_NAME=client
RELATIVE_PROJECT_ROOT_PATH=..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
ORIGIN_BUCKET_PREFIX=$(shell jq -r '.client_origin_bucket_name_prefix' $(PROJECT_CONF))
ifeq (prod,$(ENV))
  ENV_ID=$(shell jq -r '.terraform.prod.env_id' $(PROJECT_CONF))
else
ifndef ENV_ID
ENV_ID=$(shell jq -r '.outputs.env_id.value' $(RELATIVE_PROJECT_ROOT_PATH)/infrastructure/terraform/env-id/terraform.tfstate)
endif
endif
ORIGIN_BUCKET=$(ORIGIN_BUCKET_PREFIX)-$(ENV_ID)-$(ENV)
ENABLE_AUTH=$(shell jq -r '.enable_api_auth' $(PROJECT_CONF))
SSM_VERSION=$(shell jq -r '.ssm_version' $(PROJECT_CONF))
CLOUDFRONT_QUERY=Invalidation.{Status:Status,CreateTime:CreateTime}
BUILD_DIR=$(CURDIR)/public
DEPS_DIR=$(CURDIR)/node_modules
REGION=$(shell jq -r ".region" $(PROJECT_CONF))

ENV_FILE=$(CURDIR)/.env
PARAMS=$(shell jq -r '.apps.client.params[]' $(PROJECT_CONF))
SECRETS=$(shell jq -r '.apps.client.secrets[]' $(PROJECT_CONF))
ENV_VARS=$(PARAMS) $(SECRETS)

dev:
	npm run dev

start:
	npm start

###################### dependencies ######################

install:
	npm install

###################### build ######################

build:
	npm run build
	rm -f $(BUILD_DIR)/.DS_Store

###################### clean ######################

clean-env:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-env.sh \
		--app-name $(APP_NAME)

clean-deps:
	rm -rf $(DEPS_DIR)

clean:
	$(MAKE) clean-env
	$(MAKE) clean-deps

###################### secrets ######################

get-secrets: retrieve-each-secret
	@if [ ! -s $(ENV_FILE) ]; then \
		rm $(ENV_FILE); \
		echo 'no env vars required'; \
	else \
		echo 'env vars retrieved'; \
	fi

retrieve-each-secret: test-env-arg clean-env $(ENV_VARS)
$(ENV_VARS):
	@if [ $@ = AWS_REGION ]; then \
		B64_REGION=$$(echo $(REGION) | base64); \
		echo "AWS_REGION=$${B64_REGION}" >> $(ENV_FILE); \
	elif [ $@ = ENV ]; then \
		echo "JEST_ENV=$(ENV)" >> $(ENV_FILE); \
	elif [ $@ = ACCOUNT ]; then \
		for account in $(TEST_ACCOUNTS); do \
			echo "$$account=1" >> $(ENV_FILE); \
		done; \
	elif [ $@ = ENABLE_AUTH ]; then \
		echo "ENABLE_AUTH=$(ENABLE_AUTH)" >> $(ENV_FILE); \
	elif [ $@ = SECRET ]; then \
		PARAM_NAME=$(shell jq -r ".ssm_params.$@" $(PROJECT_CONF)); \
		SECRET=$$(aws ssm get-parameter \
			--name /$(ENV_ID)/$(SSM_VERSION)/$(ENV)/$$PARAM_NAME \
			--query 'Parameter.Value' \
			--with-decryption \
			--region $(REGION) \
			--output text); \
		echo "JEST_$@=$$SECRET" >> $(ENV_FILE); \
	else \
		PARAM_NAME=$(shell jq -r ".ssm_params.$@" $(PROJECT_CONF)); \
		ENV_VAR=$$(aws ssm get-parameter \
			--name /$(ENV_ID)/$(SSM_VERSION)/$(ENV)/$$PARAM_NAME \
			--query 'Parameter.Value' \
			--with-decryption \
			--region $(REGION) \
			--output text | base64); \
		echo "$@=$$ENV_VAR" >> $(ENV_FILE); \
	fi;

###################### deploy ######################

initial-deploy:
	@echo '*** skipping client initial-deploy. redeploy after environment build'

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) install
	$(MAKE) get-secrets
	$(MAKE) build
	$(MAKE) sync
ifeq (true,$(shell jq -r '.terraform.aws.build_cache' $(PROJECT_CONF)))
	$(MAKE) empty-cache
endif

sync:
	@$(MAKE) -s test-env-arg
	aws s3 sync $(BUILD_DIR)/ s3://$(ORIGIN_BUCKET) --delete

# https://stackoverflow.com/a/58451831
empty-cache:
	@$(MAKE) -s test-env-arg
	@CACHE_ID=$$(aws cloudfront list-distributions --output text \
		--query 'sort_by(DistributionList.Items[?DefaultCacheBehavior.TargetOriginId==`$(ORIGIN_BUCKET)`], &LastModifiedTime)[-1].Id'); \
	aws configure set preview.cloudfront true; \
	echo 'emptying cache'; \
	aws cloudfront create-invalidation --distribution-id $$CACHE_ID --paths "/*" --query '$(CLOUDFRONT_QUERY)'
ifeq ($(ENV), prod)
	@WWW_CACHE_ID=$$(aws cloudfront list-distributions --output text \
	--query 'sort_by(DistributionList.Items[?DefaultCacheBehavior.TargetOriginId==`www-$(ORIGIN_BUCKET)`], &LastModifiedTime)[-1].Id'); \
	echo 'emptying www cache'; \
	aws cloudfront create-invalidation --distribution-id $$WWW_CACHE_ID --paths "/*" --query '$(CLOUDFRONT_QUERY)'
endif

test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif
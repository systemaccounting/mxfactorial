APP_NAME=client
RELATIVE_PROJECT_ROOT_PATH=..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
ORIGIN_BUCKET_PREFIX=$(shell jq -r '.client_origin_bucket_name_prefix' $(PROJECT_CONF))
ORIGIN_BUCKET=$(ORIGIN_BUCKET_PREFIX)-$(ENV)
NO_AUTH=1
CLOUDFRONT_QUERY=Invalidation.{Status:Status,CreateTime:CreateTime}
BUILD_DIR=$(CURDIR)/public
DEPS_DIR=$(CURDIR)/node_modules
REGION=us-east-1

ENV_FILE=$(CURDIR)/.env
PARAMS=$(shell jq '.apps.client.params[]' $(PROJECT_CONF))
SECRETS=$(shell jq '.apps.client.secrets[]' $(PROJECT_CONF))
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
	elif [ $@ = NO_AUTH ]; then \
		echo "NO_AUTH=$(NO_AUTH)" >> $(ENV_FILE); \
	elif [ $@ = SECRET ]; then \
		SECRET=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
		echo "JEST_$@=$$SECRET" >> $(ENV_FILE); \
	else \
		ENV_VAR=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
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
	$(MAKE) empty-cache

sync:
	@$(MAKE) -s test-env-arg
	aws s3 sync $(BUILD_DIR)/ s3://$(ORIGIN_BUCKET) --delete

empty-cache:
	@$(MAKE) -s test-env-arg
	@CACHE_ID=$$(aws cloudfront list-distributions --output text \
		--query 'DistributionList.Items[?DefaultCacheBehavior.TargetOriginId==`$(ORIGIN_BUCKET)`][].Id'); \
	aws configure set preview.cloudfront true; \
	echo 'emptying cache'; \
	aws cloudfront create-invalidation --distribution-id $$CACHE_ID --paths "/*" --query '$(CLOUDFRONT_QUERY)'
ifeq ($(ENV), prod)
	@WWW_CACHE_ID=$$(aws cloudfront list-distributions --output text \
	--query 'DistributionList.Items[?DefaultCacheBehavior.TargetOriginId==`www-$(ORIGIN_BUCKET)`][].Id'); \
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
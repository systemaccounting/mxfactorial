REGION=us-east-1
DEPLOY_APP=true
NO_AUTH=1
ORIGIN_BUCKET=mxfactorial-client-$(ENV)
CLOUDFRONT_QUERY=Invalidation.{Status:Status,CreateTime:CreateTime}
BUILD_DIR=$(CURDIR)/public
DEPS_DIR=$(CURDIR)/node_modules

ENV_FILE=$(CURDIR)/.env
ENV_VARS=AWS_REGION \
POOL_ID \
CLIENT_ID \
GRAPHQL_API \
NO_AUTH

install:
	npm install

build:
	npm run build
	rm -f $(BUILD_DIR)/.DS_Store

dev:
	npm run dev

start:
	npm start

clean-env:
	rm -f $(ENV_FILE)

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
	@$(MAKE) -s test-env-arg
	$(MAKE) install
	$(MAKE) get-secrets ENV=$(ENV)
	$(MAKE) build
	$(MAKE) sync ENV=$(ENV)

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) initial-deploy ENV=$(ENV)
	$(MAKE) empty-cache ENV=$(ENV)

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
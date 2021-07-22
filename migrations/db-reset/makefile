APP_NAME = db-reset
ARTIFACT_NAME=$(APP_NAME)-src.zip
PROJECT_CONF=../../project.json
BUCKET_PREFIX=$(shell jq -r '.artifacts_bucket_name_prefix' $(PROJECT_CONF))
ARTIFACT_BUCKET=$(BUCKET_PREFIX)-$(ENV)
LAMBDA_NAME=$(APP_NAME)-$(ENV)
RUNTIME=provided
REGION = us-east-1
BASH_LAYER_ARN=arn:aws:lambda:$(REGION):744348701589:layer:bash:8

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

clean:
	rm -f $(ARTIFACT_NAME)

zip:
	zip -r $(ARTIFACT_NAME) index.sh

build:
	$(MAKE) zip

###################### deploy ######################

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) clean
	$(MAKE) zip
	$(MAKE) put-object
	$(MAKE) update-function

deploy-only:
	$(MAKE) put-object ENV=$(ENV)
	$(MAKE) update-function ENV=$(ENV)

put-object:
	@$(MAKE) -s test-env-arg
	@ETAG=$$(aws s3api put-object \
		--bucket=$(ARTIFACT_BUCKET) \
		--key=$(ARTIFACT_NAME) \
		--body=$(CURDIR)/$(ARTIFACT_NAME) \
		--region=$(REGION) \
		--output=text | xargs); \
	echo "***pushed $(ARTIFACT_NAME) artifact with ETag: $$ETAG"

update-function:
	@$(MAKE) -s test-env-arg
	@MOD=$$(aws lambda update-function-code \
		--function-name=$(LAMBDA_NAME) \
		--s3-key=$(ARTIFACT_NAME) \
		--s3-bucket=$(ARTIFACT_BUCKET) \
		--region=$(REGION) \
		--query 'LastModified' | xargs);\
	echo "***$(LAMBDA_NAME) lambda deployed @ $$MOD"

# run before deploying terraform
initial-deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) clean
	$(MAKE) zip
	$(MAKE) put-object ENV=$(ENV)

now:
	$(MAKE) clean
	$(MAKE) zip
	$(MAKE) deploy-only ENV=dev
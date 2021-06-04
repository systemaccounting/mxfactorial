APP_NAME = delete-faker
ARTIFACT_NAME=$(APP_NAME)-src.zip
ARTIFACT_BUCKET = mxfactorial-artifacts-$(ENV)
LAMBDA_NAME=$(APP_NAME)-$(ENV)
REGION = us-east-1

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

clean:
	rm -f $(ARTIFACT_NAME)

###################### build ######################

zip:
	zip -r $(ARTIFACT_NAME) index.js

###################### deploy ######################

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) clean
	$(MAKE) zip
	$(MAKE) put-object ENV=$(ENV)
	$(MAKE) update-function ENV=$(ENV)

initial-deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) clean
	$(MAKE) zip
	$(MAKE) put-object ENV=$(ENV)

put-object:
	@$(MAKE) -s test-env-arg
	@ETAG=$$(aws s3api put-object \
		--bucket=$(AARTIFACT_BUCKET) \
		--key=$(ARTIFACT_NAME) \
		--body=$(CURDIR)/$(ARTIFACT_NAME) \
		--region=$(REGION) \
		--output=text | xargs); \
	echo "***Deployed $(ENV)/$(ARTIFACT_NAME) from s3 ETag: $$ETAG"

update-function:
	@$(MAKE) -s test-env-arg
	@MOD=$$(aws lambda update-function-code \
		--function-name=$(LAMBDA_NAME) \
		--s3-key=$(ARTIFACT_NAME) \
		--s3-bucket=$(ARTIFACT_BUCKET) \
		--region=$(REGION) \
		--query 'LastModified' | xargs);\
	echo "***$(LAMBDA_NAME) lambda deployed @ $$MOD"
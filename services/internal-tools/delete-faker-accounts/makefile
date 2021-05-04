APP_NAME = delete-faker
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

clean:
	rm -f $(APP_NAME)-src.zip

###################### build ######################

zip: clean
	zip -r $(APP_NAME)-src.zip index.js

###################### deploy ######################

deploy: zip deloy-only

deploy-only: test-env-arg
	@ETAG=$$(aws s3api put-object \
		--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
		--key=$(APP_NAME)-src.zip \
		--body=$(CURDIR)/$(APP_NAME)-src.zip \
		--region=$(REGION) \
		--output=text | xargs); \
	echo "***Deployed from s3 ETag: $$ETAG"

deploy-all: deploy

initial-deploy: test-env-arg zip
	@ETAG=$$(aws s3api put-object \
		--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
		--key=$(APP_NAME)-src.zip \
		--body=$(CURDIR)/$(APP_NAME)-src.zip \
		--region=$(REGION) \
		--output=text | xargs); \
	echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"
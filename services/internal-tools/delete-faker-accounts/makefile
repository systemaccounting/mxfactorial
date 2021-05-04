DIR := ${CURDIR}
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

# aliases zip target
src: zip

###################### deploy ######################

deploy: zip deloy-only

deploy-only: test-env-arg
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed from s3 ETag: $$ETAG"

deploy-all: deploy

initial-deploy: test-env-arg zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"
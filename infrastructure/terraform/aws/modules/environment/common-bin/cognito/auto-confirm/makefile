DIR := ${CURDIR}
APP_NAME = auto-confirm
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1

.PHONY: test-env-arg
test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

.PHONY: clean
clean:
		rm -f $(APP_NAME)-src.zip

.PHONY: zip clean
zip: clean
		zip -r $(APP_NAME)-src.zip index.js

###################### build ######################
# aliases zip target
.PHONY: src zip
src: zip

###################### deploy ######################

.PHONY: deploy test-env-arg zip
deploy: test-env-arg zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"

.PHONY: deploy-all deploy
deploy-all: deploy

.PHONY: initial-deploy test-env-arg clean zip
initial-deploy: test-env-arg clean zip
		@ETAG=$$(aws s3api put-object \
			--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
			--key=$(APP_NAME)-src.zip \
			--body=$(DIR)/$(APP_NAME)-src.zip \
			--region=$(REGION) \
			--output=text | sed 's/"//g'); \
		echo "***Deployed $(ENV)/$(APP_NAME)-src.zip from s3 ETag: $$ETAG"
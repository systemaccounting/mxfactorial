APP_NAME = go-migrate
ARTIFACT_NAME = $(APP_NAME)-src.zip
LAMBDA_NAME = $(APP_NAME)-$(ENV)
ARTIFACT_BUCKET = mxfactorial-artifacts-$(ENV)
RUNTIME=provided
REGION = us-east-1
TMP_MIGRATE_REPO_DIR=./build
MIGRATE_BINARY_NAME=migrate.linux-amd64
PSQL_LAMBDA_ARCHIVE=psql11-lambda.zip
LAMBDA_LAYER_ARCHIVE=$(APP_NAME)-layer.zip
DEPLOY_APP=true
BASH_LAYER_ARN=arn:aws:lambda:$(REGION):744348701589:layer:bash:8
# from https://github.com/golang-migrate/migrate/blob/master/Makefile to avoid building for every os
DATABASE ?= postgres mysql redshift cassandra spanner cockroachdb clickhouse mongodb sqlserver firebird neo4j pgx
DATABASE_TEST ?= $(DATABASE) sqlite sqlcipher
VERSION ?= $(shell git describe --tags 2>/dev/null | cut -c 2-)
test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

clean:
	$(MAKE) clean-script
	$(MAKE) clean-layer
	$(MAKE) clean-build-dir

clean-script:
	rm -f $(ARTIFACT_NAME)

clean-layer:
	rm -f $(LAMBDA_LAYER_ARCHIVE)

clean-build-dir:
	rm -rf $(TMP_MIGRATE_REPO_DIR)

zip:
	$(MAKE) clean-script
	zip -r $(ARTIFACT_NAME) index.sh

build-layer:
	$(MAKE) clean
	$(MAKE) build
	(cd $(TMP_MIGRATE_REPO_DIR); zip -r $(LAMBDA_LAYER_ARCHIVE) bin lib; mv $(LAMBDA_LAYER_ARCHIVE) ../)
	$(MAKE) clean-build-dir

###################### secrets ######################

get-secrets: retrieve-each-secret
	@if [ ! -s $(CURDIR)/.env ]; then \
		rm $(CURDIR)/.env; \
		echo 'no env vars required'; \
	else \
		echo 'env vars retrieved'; \
	fi

retrieve-each-secret: test-env-arg clean-env $(ENV_VARS)
$(ENV_VARS):
	@if [ $@ = AWS_REGION ]; then \
		echo AWS_REGION=$(REGION) >> $(CURDIR)/.env; \
	else \
		ENV_VAR=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
			echo $@=$$ENV_VAR \
			>> $(CURDIR)/.env; \
	fi

###################### build ######################

build-psql:
	docker build --force-rm --progress=plain -t psql-lambda .
	CONTAINER_ID=$$(docker create psql-lambda --name psql-lambda); \
	docker cp $$CONTAINER_ID:/tmp/$(PSQL_LAMBDA_ARCHIVE) $(TMP_MIGRATE_REPO_DIR)/$(PSQL_LAMBDA_ARCHIVE)

build:
	rm -f $(LAMBDA_LAYER_ARCHIVE)
	rm -rf $(TMP_MIGRATE_REPO_DIR)
	git clone --depth 1 --single-branch --branch master https://github.com/golang-migrate/migrate.git $(TMP_MIGRATE_REPO_DIR)
	-mkdir $(TMP_MIGRATE_REPO_DIR)/bin
	-mkdir $(TMP_MIGRATE_REPO_DIR)/lib
	(cd $(TMP_MIGRATE_REPO_DIR)/cmd/migrate && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -o ../../bin/$(MIGRATE_BINARY_NAME) -ldflags='-X main.Version=$(VERSION) -extldflags "-static"' -tags '$(DATABASE) $(SOURCE)' .)
	$(MAKE) build-psql
	unzip $(TMP_MIGRATE_REPO_DIR)/$(PSQL_LAMBDA_ARCHIVE) -d $(TMP_MIGRATE_REPO_DIR)/bin
	(mv $(TMP_MIGRATE_REPO_DIR)/bin/*.so* $(TMP_MIGRATE_REPO_DIR)/lib)

###################### deploy ######################

deploy-script:
	@$(MAKE) -s test-env-arg
	$(MAKE) zip
	$(MAKE) put-object
	$(MAKE) update-function

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

deploy-layer:
	@$(MAKE) -s test-env-arg
	$(MAKE) build-layer
	$(MAKE) put-layer
	$(MAKE) update-lambda-layer:

put-layer:
	@ETAG=$$(aws s3api put-object \
		--bucket=$(ARTIFACT_BUCKET) \
		--key=$(APP_NAME)-layer.zip \
		--body=$(CURDIR)/$(APP_NAME)-layer.zip \
		--region=$(REGION) \
		--output=text | xargs); \
	echo "***Deployed $(ENV)/$(APP_NAME)-layer.zip from s3 ETag: $$ETAG"

update-lambda-layer:
	@$(MAKE) -s test-env-arg
	@LAYER_VERSION_ARN=$$(aws lambda publish-layer-version \
		--layer-name=$(APP_NAME)-$(RUNTIME)-deps-$(ENV) \
		--description="$(APP_NAME) dependencies in $(ENV)" \
		--content=S3Bucket=$(ARTIFACT_BUCKET),S3Key=$(APP_NAME)-layer.zip \
		--region=$(REGION) \
		--query 'LayerVersionArn' \
		--output=text | xargs); \
	aws lambda update-function-configuration \
		--function-name $(LAMBDA_NAME) \
		--region=$(REGION) \
		--query='LastModified' \
		--layers $$LAYER_VERSION_ARN $(BASH_LAYER_ARN); \
	LAYER_VERSION=$$(echo $$LAYER_VERSION_ARN | cut -d ':' -f8); \
	echo "***updated lambda $(APP_NAME)-$(RUNTIME)-deps-$(ENV) layer as version $$LAYER_VERSION"

publish-layer:
	@$(MAKE) -s test-env-arg
	@LAYER_VERSION_ARN=$$(aws lambda publish-layer-version \
		--layer-name=$(APP_NAME)-$(RUNTIME)-deps-$(ENV) \
		--description="$(APP_NAME) dependencies in $(ENV)" \
		--content=S3Bucket=$(ARTIFACT_BUCKET),S3Key=$(APP_NAME)-layer.zip \
		--region=$(REGION) \
		--query 'LayerVersionArn' \
		--output=text | xargs); \
	LAYER_VERSION=$$(echo $$LAYER_VERSION_ARN | cut -d ':' -f8); \
	echo "***published $(APP_NAME)-$(RUNTIME)-deps-$(ENV) layer as version $$LAYER_VERSION"

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) build-layer
	$(MAKE) put-layer ENV=$(ENV)
	$(MAKE) update-lambda-layer ENV=$(ENV)
	$(MAKE) zip
	$(MAKE) put-object ENV=$(ENV)
	$(MAKE) update-function ENV=$(ENV)

# run before deploying terraform
initial-deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) build-layer
	$(MAKE) put-layer ENV=$(ENV)
	$(MAKE) publish-layer ENV=$(ENV)
	$(MAKE) zip
	$(MAKE) put-object ENV=$(ENV)
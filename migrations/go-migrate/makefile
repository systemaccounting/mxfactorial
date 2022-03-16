APP_NAME = go-migrate
ARTIFACT_NAME = $(APP_NAME)-src.zip
LAMBDA_NAME = $(APP_NAME)-$(ENV)
RELATIVE_PROJECT_ROOT_PATH=../..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
BUCKET_PREFIX=$(shell jq -r '.artifacts_bucket_name_prefix' $(PROJECT_CONF))
EXECUTABLE_NAME=$(shell jq -r ".apps.\"$(APP_NAME)\".\"executable-name\"" $(PROJECT_CONF))
ARTIFACT_BUCKET=$(BUCKET_PREFIX)-$(ENV)
RUNTIME=provided
REGION = us-east-1
TMP_MIGRATE_REPO_DIR=./build
MIGRATE_BINARY_NAME=migrate.linux-amd64
PSQL_LAMBDA_ARCHIVE=psql11-lambda.zip
LAMBDA_LAYER_ARCHIVE=$(APP_NAME)-layer.zip
BASH_LAYER_ARN=arn:aws:lambda:$(REGION):744348701589:layer:bash:8
# from https://github.com/golang-migrate/migrate/blob/master/Makefile to avoid building for every os
DATABASE ?= postgres mysql redshift cassandra spanner cockroachdb clickhouse mongodb sqlserver firebird neo4j pgx
DATABASE_TEST ?= $(DATABASE) sqlite sqlcipher
VERSION ?= $(shell git describe --tags 2>/dev/null | cut -c 2-)
DOCKER_IMAGE_NAME=psql-lambda
DOCKER_CONTAINER_NAME=$(DOCKER_IMAGE_NAME)

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

test-docker-availability:
	@docker version > /dev/null 2>&1; if [[ $$? -ne 0 ]]; then echo "\033[1;31mdocker required. start docker \033[0m"; fi

###################### dependencies ######################

install:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/download-go-mod.sh

###################### build ######################

build:
	$(MAKE) clean-layer
	$(MAKE) clean-build-dir
	git clone --depth 1 --single-branch --branch master https://github.com/golang-migrate/migrate.git $(TMP_MIGRATE_REPO_DIR)
	-mkdir $(TMP_MIGRATE_REPO_DIR)/bin
	-mkdir $(TMP_MIGRATE_REPO_DIR)/lib
	(cd $(TMP_MIGRATE_REPO_DIR)/cmd/migrate && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -o ../../bin/$(MIGRATE_BINARY_NAME) -ldflags='-X main.Version=$(VERSION) -extldflags "-static"' -tags '$(DATABASE) $(SOURCE)' .)
	$(MAKE) build-psql
	unzip $(TMP_MIGRATE_REPO_DIR)/$(PSQL_LAMBDA_ARCHIVE) -d $(TMP_MIGRATE_REPO_DIR)/bin
	(mv $(TMP_MIGRATE_REPO_DIR)/bin/*.so* $(TMP_MIGRATE_REPO_DIR)/lib)

build-layer:
	$(MAKE) clean
	$(MAKE) build
	(cd $(TMP_MIGRATE_REPO_DIR); zip -r $(LAMBDA_LAYER_ARCHIVE) bin lib; mv $(LAMBDA_LAYER_ARCHIVE) ../)
	$(MAKE) clean-build-dir

build-psql:
	$(MAKE) test-docker-availability
	docker build --force-rm --progress=plain -t $(DOCKER_IMAGE_NAME) .
	CONTAINER_ID=$$(docker create $(DOCKER_IMAGE_NAME) --name $(DOCKER_CONTAINER_NAME)); \
	docker cp $$CONTAINER_ID:/tmp/$(PSQL_LAMBDA_ARCHIVE) $(TMP_MIGRATE_REPO_DIR)/$(PSQL_LAMBDA_ARCHIVE)

zip:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/zip-executable.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
		--executable-name $(EXECUTABLE_NAME)

###################### clean ######################

clean:
	$(MAKE) clean-artifact
	$(MAKE) clean-layer
	$(MAKE) clean-build-dir
	$(MAKE) clean-containers
	$(MAKE) clean-image

clean-artifact:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-artifact.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME)

clean-layer:
	rm -f $(LAMBDA_LAYER_ARCHIVE)

clean-build-dir:
	rm -rf $(TMP_MIGRATE_REPO_DIR)

clean-containers:
	docker ps -a | awk '{ print $$1,$$2 }' | grep $(DOCKER_IMAGE_NAME) | awk '{print $$1 }' | xargs -I {} docker rm {}

clean-image:
	-docker rmi $(DOCKER_IMAGE_NAME)

###################### deploy ######################

deploy-script:
	@$(MAKE) -s test-env-arg
	$(MAKE) clean-artifact
	$(MAKE) zip
	$(MAKE) put-object
	$(MAKE) update-function

put-object:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/put-object.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
        --env $(ENV) \
        --region $(REGION)

update-function:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/update-function.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
        --env $(ENV) \
        --region $(REGION)

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
	echo "*** deployed $(ENV)/$(APP_NAME)-layer.zip from s3 ETag: $$ETAG"

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
	echo "*** updated lambda $(APP_NAME)-$(RUNTIME)-deps-$(ENV) layer as version $$LAYER_VERSION"

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
	echo "*** published $(APP_NAME)-$(RUNTIME)-deps-$(ENV) layer as version $$LAYER_VERSION"

deploy:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s clean
	$(MAKE) build-layer
	$(MAKE) put-layer
	$(MAKE) update-lambda-layer
	$(MAKE) zip
	$(MAKE) put-object
	$(MAKE) update-function

# run before deploying terraform
initial-deploy:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s clean
	$(MAKE) build-layer
	$(MAKE) put-layer
	$(MAKE) publish-layer
	$(MAKE) zip
	$(MAKE) put-object
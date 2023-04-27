APP_NAME=$(shell basename $(CURDIR))
ARTIFACT_NAME=$(APP_NAME)-src.zip
RELATIVE_PROJECT_ROOT_PATH=../..
PROJECT_CONF_FILE_NAME=project.yaml
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
BUCKET_PREFIX=$(shell yq '.infrastructure.terraform.aws.modules.["project-storage"].env_var.set.ARTIFACTS_BUCKET_PREFIX.default' $(PROJECT_CONF))
ENV_ID=$(shell (cd $(RELATIVE_PROJECT_ROOT_PATH); ENV=$(ENV) PROJECT_CONF=$(PROJECT_CONF) . ./scripts/print-env-id.sh))
LAMBDA_NAME=$(APP_NAME)-$(ENV_ID)-$(ENV)
ARTIFACT_BUCKET=$(BUCKET_PREFIX)-$(ENV_ID)-$(ENV)
GO_MIGRATE_SCRIPT_NAME=$(shell yq '.migrations["go-migrate"].env_var.set.GO_MIGRATE_SCRIPT_NAME.default' $(PROJECT_CONF))
RUNTIME=provided
REGION=$(shell yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $(PROJECT_CONF))
TMP_MIGRATE_REPO_DIR=./build
LAMBDA_LAYER_ARCHIVE=$(APP_NAME)-layer.zip
LAMBDA_LAYER_NAME=$(APP_NAME)-$(RUNTIME)-deps-$(ENV_ID)-$(ENV)
BASH_LAYER_ARN=arn:aws:lambda:$(REGION):744348701589:layer:bash:8
DOCKER_USER=$(shell yq ".docker.env_var.set.DOCKER_USER.default" $(PROJECT_CONF))
GO_MIGRATE_DOCKER_REPOSITORY=$(shell yq '.migrations["go-migrate"].env_var.set.GO_MIGRATE_DOCKER_REPOSITORY.default' $(PROJECT_CONF))
DOCKER_TAG_VERSION=v1
DOCKER_IMAGE_NAME=$(DOCKER_USER)/$(GO_MIGRATE_DOCKER_REPOSITORY):$(DOCKER_TAG_VERSION)

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

test-docker-availability:
	@docker version > /dev/null 2>&1; if [ $$? -ne 0 ]; then echo "\033[1;31mdocker required. start docker \033[0m"; fi

###################### dependencies ######################

install:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/download-go-mod.sh

###################### build ######################

build-layer:
	$(MAKE) test-docker-availability
	$(MAKE) pull-or-build
	$(MAKE) docker-copy

pull-or-build:
	$(MAKE) clean-layer
	$(MAKE) clean-build-dir
	$(MAKE) test-docker-availability
	docker pull $(DOCKER_IMAGE_NAME) 2>/dev/null; \
	if [ "$$?" -ne 0 ]; then \
		docker build \
			--force-rm \
			--progress=plain \
			-f $(RELATIVE_PROJECT_ROOT_PATH)/docker/go-migrate.Dockerfile \
			-t $(DOCKER_IMAGE_NAME) . ; \
	fi;

push:
	docker image push $(DOCKER_IMAGE_NAME)

docker-copy:
	$(MAKE) test-docker-availability
	CONTAINER_ID=$$(docker create $(DOCKER_IMAGE_NAME) --name go-migrate); \
	docker cp $$CONTAINER_ID:/tmp/$(LAMBDA_LAYER_ARCHIVE) $(LAMBDA_LAYER_ARCHIVE)

zip:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/zip-executable.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
		--executable-name $(GO_MIGRATE_SCRIPT_NAME)

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
	-docker rmi -f $(DOCKER_IMAGE_NAME)

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
        --env $(ENV)

update-function:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/update-function.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
        --env $(ENV)

deploy-layer:
	@$(MAKE) -s test-env-arg
	$(MAKE) build-layer
	$(MAKE) put-layer
	$(MAKE) update-lambda-layer

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
		--layer-name=$(LAMBDA_LAYER_NAME) \
		--description="$(ENV_ID) $(APP_NAME) dependencies in $(ENV)" \
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
	echo "*** updated lambda $(LAMBDA_LAYER_NAME) layer as version $$LAYER_VERSION"

publish-layer:
	@$(MAKE) -s test-env-arg
	@LAYER_VERSION_ARN=$$(aws lambda publish-layer-version \
		--layer-name=$(LAMBDA_LAYER_NAME) \
		--description="$(APP_NAME) dependencies in $(ENV_ID) $(ENV)" \
		--content=S3Bucket=$(ARTIFACT_BUCKET),S3Key=$(APP_NAME)-layer.zip \
		--region=$(REGION) \
		--query 'LayerVersionArn' \
		--output=text | xargs); \
	LAYER_VERSION=$$(echo $$LAYER_VERSION_ARN | cut -d ':' -f8); \
	echo "*** published $(LAMBDA_LAYER_NAME) layer as version $$LAYER_VERSION"

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
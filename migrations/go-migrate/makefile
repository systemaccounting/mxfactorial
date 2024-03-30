APP_NAME=$(shell basename $(CURDIR))
RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
PROJECT_CONF_FILE_NAME=project.yaml
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
ENV_ID=$(shell (cd $(RELATIVE_PROJECT_ROOT_PATH); ENV=$(ENV) PROJECT_CONF=$(PROJECT_CONF) . ./scripts/print-env-id.sh))
TAG_VERSION=latest
IMAGE_NAME=$(IMAGE_PREFIX)-$(ENV_ID)-$(ENV):$(TAG_VERSION)

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

build-image:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	docker build -f ./docker/go-migrate.Dockerfile -t $(APP_NAME) ./migrations/go-migrate

push-image:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/push-ecr-image.sh --image-prefix $(APP_NAME) --env $(ENV)

deploy-image:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/update-function-image.sh --app-name $(APP_NAME) --env $(ENV)

update-image:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s build-image
	@$(MAKE) -s push-image
	@$(MAKE) -s deploy-image

clean-artifact:
	@for i in $$(docker image ls | grep '$(APP_NAME)' | awk '{print $$3}'); do docker rmi -f "$$i"; done;

clean:
	@$(MAKE) clean-artifact

build:
	@$(MAKE) clean
	@$(MAKE) build-image

###################### globally required ######################

initial-deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) build
	$(MAKE) push-image

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) build
	$(MAKE) push-image
	$(MAKE) deploy-image

deploy-only:
	@$(MAKE) -s test-env-arg
	$(MAKE) push-image
	$(MAKE) deploy-image

now:
	$(MAKE) build
	$(MAKE) push-image ENV=dev
	$(MAKE) deploy-image ENV=dev
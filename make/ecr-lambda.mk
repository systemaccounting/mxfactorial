BUILD_CTX?=.

build-image:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/build-image.sh --app-name $(APP_NAME) --build-ctx $(BUILD_CTX)

tag-dev-image:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/tag-dev-image.sh --app-name $(APP_NAME)

push-dev-image:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/push-dev-image.sh --app-name $(APP_NAME)

deploy-dev-image:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/deploy-dev-image.sh --app-name $(APP_NAME)

update-dev-function:
	@$(MAKE) -s build-image
	@$(MAKE) -s tag-dev-image
	@$(MAKE) -s push-dev-image
	@$(MAKE) -s deploy-dev-image

clean-image:
	@for i in $$(docker image ls | grep '$(APP_NAME)' | awk '{print $$3}'); do docker rmi -f "$$i"; done;

###################### globally required ######################

initial-deploy:
	@$(MAKE) -s build-image
	@$(MAKE) -s tag-dev-image
	@$(MAKE) -s push-dev-image

deploy:
	@$(MAKE) -s update-dev-function

deploy-only:
	@$(MAKE) -s tag-dev-image
	@$(MAKE) -s push-dev-image
	@$(MAKE) -s deploy-dev-image

now:
	@$(MAKE) -s update-dev-function
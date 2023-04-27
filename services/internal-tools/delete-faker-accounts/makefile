APP_NAME = delete-faker
ARTIFACT_NAME=$(APP_NAME)-src.zip
RELATIVE_PROJECT_ROOT_PATH=../..

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### build ######################

zip:
	zip -r $(ARTIFACT_NAME) index.js

###################### clean ######################

clean:
	$(MAKE) clean-artifact

clean-artifact:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-artifact.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME)

###################### deploy ######################

deploy:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s clean
	$(MAKE) zip
	$(MAKE) put-object
	$(MAKE) update-function

initial-deploy:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s clean
	$(MAKE) zip
	$(MAKE) put-object

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
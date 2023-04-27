RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/go.mk

TEST_DATA_PATH=$(RELATIVE_PROJECT_ROOT_PATH)/pkg/testdata/requestNotification.json

run:
	@$(DOCKER_ENV_VARS) go run ./cmd/main.go

publish:
	$(MAKE) -s test-env-file
	eval $$(cat $(ENV_FILE)); aws sns publish \
		--region $(REGION) \
		--topic-arn $$NOTIFY_TOPIC_ARN \
		--message "$$(cat $(TEST_DATA_PATH))"
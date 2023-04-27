RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/go.mk

signup:
	@$(MAKE) -s test-env-file
	@$(MAKE) -s test-acc-arg
	-@$(MAKE) rmuser
	eval $$(cat .env); aws cognito-idp sign-up \
		--region $(REGION) \
		--client-id $$CLIENT_ID \
		--username $(ACC) \
		--password $(ACC)

rmuser:
	@$(MAKE) -s test-env-file
	@$(MAKE) -s test-acc-arg
	eval $$(cat .env); aws cognito-idp admin-delete-user \
		--user-pool-id $$POOL_ID \
		--username $(ACC)

createuser:
	@$(MAKE) -s test-env-file
	@$(MAKE) -s test-acc-arg
	@eval $$(cat .env); aws cognito-idp admin-create-user \
		--user-pool-id $$POOL_ID \
		--username $(ACC) \
		--client-metadata skip=true \
		--query 'User.UserCreateDate'; \
	eval $$(cat .env); aws cognito-idp admin-set-user-password \
		--region $(REGION) \
		--user-pool-id $$POOL_ID \
		--username $(ACC) \
		--password password \
		--permanent;
# first, provision environment artifact bucket in terraform (e.g. stg):
# infrastructure/terraform/aws/environments/us-east-1/certs-and-s3.tf
# then `make deploy ENV=stg` to push all artifacts to new stg bucket

CMD = initial-deploy

test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

deploy: test-env-arg
	@$(MAKE) -C services/graphql-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C services/trans-query-account-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C services/trans-query-id-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C services/req-query-trans-id-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C services/req-query-account-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C services/request-create-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C services/request-approve-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C services/notification/notification-clear-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C services/notification/notification-get-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C services/notification/notification-send-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C services/notification/wss-notif-connect-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C services/rules-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C schema/clone-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C schema/migrate-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C infrastructure/terraform/aws/modules/environment/common-bin/cognito/auto-confirm ENV=$(ENV) $(CMD)
	@$(MAKE) -C infrastructure/terraform/aws/modules/environment/common-bin/cognito/delete-faker-accounts ENV=$(ENV) $(CMD)
	@$(MAKE) -C infrastructure/terraform/aws/modules/environment/common-bin/deploy-lambda ENV=$(ENV) $(CMD)
	@$(MAKE) -C infrastructure/terraform/aws/modules/environment/common-bin/rds ENV=$(ENV) $(CMD)
	@$(MAKE) -C infrastructure/cloudformation/s3-event-faas ENV=$(ENV) $(CMD)

init:
	go mod init github.com/systemaccounting/mxfactorial
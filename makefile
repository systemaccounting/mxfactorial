# first, provision environment artifact bucket in terraform (e.g. stg):
# infrastructure/terraform/aws/environments/us-east-1/certs-and-s3.tf
# then `make deploy ENV=stg` to push all artifacts to new stg bucket

CMD = initial-deploy

.PHONY: test-env-arg
test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

.PHONY: deploy test-env-arg
deploy: test-env-arg
	@$(MAKE) -C services/graphql-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C services/measure-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C services/rules-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C services/transact-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C schema/clone-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C schema/update-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C infrastructure/terraform/aws/modules/environment/common-bin/cognito/auto-confirm ENV=$(ENV) $(CMD)
	@$(MAKE) -C infrastructure/terraform/aws/modules/environment/common-bin/cognito/delete-faker-accounts ENV=$(ENV) $(CMD)
	@$(MAKE) -C infrastructure/terraform/aws/modules/environment/common-bin/deploy-lambda ENV=$(ENV) $(CMD)
	@$(MAKE) -C infrastructure/terraform/aws/modules/environment/common-bin/rds ENV=$(ENV) $(CMD)
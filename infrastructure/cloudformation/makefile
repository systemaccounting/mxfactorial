# artifact bucket for cloudformation required before provisioning.
# first, provision environment artifact bucket in terraform (e.g. stg):
# infrastructure/terraform/aws/environments/us-east-1/certs-and-s3.tf
# then `make deploy ENV=stg` to push all artifacts to new stg bucket

CMD = initial-deploy

test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

deploy: test-env-arg
	@$(MAKE) -C s3-event-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C ../../services/notification/wss-notif-auth-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C ../../services/notification/wss-notif-connect-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C ../../services/notification/notification-clear-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C ../../services/notification/notification-get-faas ENV=$(ENV) $(CMD)
	@$(MAKE) -C ../../services/notification/notification-send-faas ENV=$(ENV) $(CMD)
RELATIVE_PROJECT_ROOT_PATH=..
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
SSH_KEY_SSM_SUFFIX=$(shell yq '.infra.terraform.aws.modules.microk8s.env_var.set.MICROK8S_SSH_PRIV_KEY.ssm' $(PROJECT_CONF))
MICROK8S_SSH_KEY_NAME_PREFIX=$(shell yq '.infra.terraform.aws.modules.microk8s.env_var.set.MICROK8S_SSH_KEY_NAME_PREFIX.default' $(PROJECT_CONF))
MICROK8S_SSH_USER=$(shell yq '.infra.terraform.aws.modules.microk8s.env_var.set.MICROK8S_SSH_USER.default' $(PROJECT_CONF))
MICROK8S_MANIFESTS_DIR=$(shell yq '.infra.terraform.aws.modules.microk8s.env_var.set.MICROK8S_MANIFESTS_DIR.default' $(PROJECT_CONF))

# avoid assigning ENV_ID on local commands or when ENV is not assigned
ifneq ($(origin ENV), undefined)
ifneq ($(ENV), local)
    ENV_ID=$(shell cd $(RELATIVE_PROJECT_ROOT_PATH); ENV=$(ENV) bash scripts/print-env-id.sh)
    ID_ENV=$(ENV_ID)-$(ENV)
    SSH_KEY=$(ID_ENV).pem
	MICROK8S_NAME=$(MICROK8S_SSH_KEY_NAME_PREFIX)-$(ID_ENV)
	MANIFESTS_DIR=/home/$(MICROK8S_SSH_USER)/$(MICROK8S_MANIFESTS_DIR)
endif
endif

deploy-local:
	@$(MAKE) --no-print-directory -C local env ENV=local
	ytt --data-values-file ./local/$(ENV_FILE_NAME) -f . | kubectl apply -f -

delete-local:
	@$(MAKE) --no-print-directory -C local env ENV=local
	ytt --data-values-file ./local/$(ENV_FILE_NAME) -f . | kubectl delete -f -

delete-all-local:
	kubectl delete all --all -n default

list-all:
	kubectl get all -n default

### cloud

get-ssh-key:
	@$(MAKE) -s test-env-arg
	(cd $(RELATIVE_PROJECT_ROOT_PATH); bash scripts/get-ssh-key.sh --env $(ENV) --ssm-suffix $(SSH_KEY_SSM_SUFFIX) --dir $(CURDIR))

connect:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s get-ssh-key
	@K8S_IP=$$(aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" "Name=tag:Name,Values=$(MICROK8S_NAME)" --query "Reservations[].Instances[0].PublicIpAddress" --output text); \
	ssh -q -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes -i $(SSH_KEY) $(MICROK8S_SSH_USER)@$$K8S_IP

deploy:
	@$(MAKE) -s test-env-arg
	@$(MAKE) --no-print-directory -C dev env ENV=dev
	@$(MAKE) -s get-ssh-key
	@echo "*** wating for ok instance status before deploying..."
	@INSTANCE_ID=$$(aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" "Name=tag:Name,Values=$(MICROK8S_NAME)" --query "Reservations[].Instances[0].InstanceId" --output text); \
	aws ec2 wait instance-status-ok --instance-ids $$INSTANCE_ID
	@$(MAKE) -s deploy-now

deploy-now:
	@$(MAKE) -s test-env-arg
	@echo "*** deploying..."
	@K8S_IP=$$(aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" "Name=tag:Name,Values=$(MICROK8S_NAME)" --query "Reservations[].Instances[0].PublicIpAddress" --output text); \
	scp -q -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes -i $(SSH_KEY) event.yml measure.yml redis.yml $(MICROK8S_SSH_USER)@$$K8S_IP:$(MANIFESTS_DIR); \
	scp -q -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes -i $(SSH_KEY) -r ./$(ENV) $(MICROK8S_SSH_USER)@$$K8S_IP:$(MANIFESTS_DIR)/; \
	ssh -q -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes -i $(SSH_KEY) $(MICROK8S_SSH_USER)@$$K8S_IP 'ytt --data-values-file $(MANIFESTS_DIR)/$(ENV)/$(ENV_FILE_NAME) -f $(MANIFESTS_DIR) | microk8s kubectl apply -f -'

delete-all:
	@$(MAKE) -s test-env-arg
	@K8S_IP=$$(aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" "Name=tag:Name,Values=$(MICROK8S_NAME)" --query "Reservations[].Instances[0].PublicIpAddress" --output text); \
	ssh -q -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes -i $(SSH_KEY) $(MICROK8S_SSH_USER)@$$K8S_IP 'microk8s kubectl delete all --all -n default'
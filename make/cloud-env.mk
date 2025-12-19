# add unique dev environment ID to root .env file
env-id:
	@bash scripts/create-env-id.sh

# delete unique dev environment ID from root .env file
delete-env-id:
	@bash scripts/delete-env-id.sh

# print unique dev environment ID from root .env file
print-env-id:
	@bash scripts/print-env-id.sh

# build dev environment infrastructure in aws
build-dev:
	bash scripts/build-dev-env.sh

# delete dev environment infrastructure in aws
delete-dev:
	bash scripts/delete-dev-env.sh

# delete dev environment state files locally
delete-dev-state:
	(cd infra/terraform/aws/environments/dev; rm -rf .terraform* .tfplan*)

# initialize terraform with current dev environment state
init-dev:
	bash scripts/terraform-init-dev.sh \
		--key $(TFSTATE_ENV_FILE) \
		--dir infra/terraform/aws/environments/dev

# resume using dev environment infrastructure in aws
set-env-id:
	$(MAKE) resume-dev

# resume using dev environment infrastructure in aws
resume-dev:
	$(MAKE) -C infra/terraform/aws/environments/dev resume

# create new iam user and policies for gitpod access to dev environment
new-iam:
	bash scripts/manage-gitpod-iam.sh --new

# delete iam user and policies for gitpod access to dev environment
delete-iam:
	bash scripts/manage-gitpod-iam.sh --delete
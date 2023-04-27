locals {
  PROJECT_CONF = yamldecode(file("../../../../../project.yaml"))
  REGION       = local.PROJECT_CONF.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default
  ENV_ID       = jsondecode(file("../../../env-id/terraform.tfstate")).outputs.env_id.value
}

terraform {
  backend "s3" {} // override with scripts/terraform-init-dev.sh
}

provider "aws" {
  region = local.REGION
}

module "apigw_logging" {
  source = "../../modules/region/v001"
  region = local.REGION
  env_id = local.ENV_ID
}

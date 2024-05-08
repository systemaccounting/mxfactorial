locals {
  PROJECT_CONF = yamldecode(file("../../../../../project.yaml"))
  REGION       = local.PROJECT_CONF.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default
}

provider "aws" {
  region = local.REGION
}

module "apigw_logging" {
  source = "../../modules/region/v001"
}

locals {
  APP              = "mxfactorial"
  ENV              = "dev"
  APP_ENV          = "${local.APP}-${local.ENV}"
  PROJECT_CONF     = yamldecode(file("../../../../../project.yaml"))
  STORAGE_ENV_VAR  = local.PROJECT_CONF.infra.terraform.aws.modules.project-storage.env_var.set
  ARTIFACTS_PREFIX = local.STORAGE_ENV_VAR.ARTIFACTS_BUCKET_PREFIX.default
  TFSTATE_PREFIX   = local.STORAGE_ENV_VAR.TFSTATE_BUCKET_PREFIX.default
  INFRA_ENV_VAR    = local.PROJECT_CONF.infra.terraform.aws.modules.environment.env_var.set
  NAME_PREFIX       = local.INFRA_ENV_VAR.NAME_PREFIX.default
  REGION           = local.INFRA_ENV_VAR.REGION.default
  ENV_ID           = module.env_id.ENV_ID
  ID_ENV           = "${local.ENV_ID}-${local.ENV}"
}

terraform {
  backend "s3" {} // override with scripts/terraform-init-dev.sh
}

module "env_id" {
  source = "../../../modules/env-id/v001"
}

provider "aws" {
  region = local.REGION
  default_tags {
    tags = {
      env_id = local.ENV_ID
      env    = local.ENV
    }
  }
}

// IMPORTANT: first build lambda artifacts using `make all CMD=initial-deploy ENV=$ENV` from project root
module "dev" {
  source = "../../modules/environment/v001"

  ############### shared ###############

  env                   = local.ENV
  artifacts_bucket_name = "${local.ARTIFACTS_PREFIX}-${local.ID_ENV}"
  env_id                = local.ENV_ID
  build_db              = local.PROJECT_CONF.scripts.env_var.set.BUILD_DB.default    // false during terraform development
  build_cache           = local.PROJECT_CONF.scripts.env_var.set.BUILD_CACHE.default // false during terraform development

  ############### ssm ###############

  ssm_prefix = "${local.ENV_ID}/${local.INFRA_ENV_VAR.SSM_VERSION.default}/${local.ENV}"

  ############### lambda ###############

  initial_account_balance = 1000

  ############### rds ###############

  rds_allow_major_version_upgrade = true
  rds_instance_class              = "db.t3.micro"
  rds_parameter_group             = "default.postgres14"
  rds_engine_version              = "14.17"
  rds_instance_name               = "${local.NAME_PREFIX}-${local.ID_ENV}"
  db_snapshot_id                  = null

  ############### api gateway ###############

  // change graphql_deployment_version when switching
  enable_api_auth = local.INFRA_ENV_VAR.ENABLE_API_AUTH.default
  # terraform keeps applying changes to apigwv2_logging_level
  # even when it doesnt change so commenting out
  # apigwv2_logging_level = "OFF" // OFF, INFO, ERROR
  apigwv2_burst_limit = 5000
  apigwv2_rate_limit  = 10000

  // change value to deploy api
  graphql_deployment_version     = 1
  apigw_authorization_header_key = "Authorization"

  // apigw v2
  enable_api_auto_deploy = true

  ############### k8s ###############

  microk8s_instance_type = "t2.medium"
  enable_microk8s        = false
}

locals {
  APP              = "mxfactorial"
  ENV              = "dev"
  APP_ENV          = "${local.APP}-${local.ENV}"
  PROJECT_CONF     = yamldecode(file("../../../../../project.yaml"))
  STORAGE_ENV_VAR  = local.PROJECT_CONF.infrastructure.terraform.aws.modules.project-storage.env_var.set
  ORIGIN_PREFIX    = local.STORAGE_ENV_VAR.CLIENT_ORIGIN_BUCKET_PREFIX.default
  ARTIFACTS_PREFIX = local.STORAGE_ENV_VAR.ARTIFACTS_BUCKET_PREFIX.default
  TFSTATE_PREFIX   = local.STORAGE_ENV_VAR.TFSTATE_BUCKET_PREFIX.default
  INFRA_ENV_VAR    = local.PROJECT_CONF.infrastructure.terraform.aws.modules.environment.env_var.set
  RDS_PREFIX       = local.INFRA_ENV_VAR.RDS_PREFIX.default
  REGION           = local.INFRA_ENV_VAR.REGION.default
  ENV_ID           = jsondecode(file("../../../env-id/terraform.tfstate")).outputs.env_id.value
  ID_ENV           = "${local.ENV_ID}-${local.ENV}"
}

terraform {
  backend "s3" {} // override with scripts/terraform-init-dev.sh
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
  rds_instance_name               = "${local.RDS_PREFIX}-${local.ID_ENV}"
  db_snapshot_id                  = null

  ############### api gateway ###############

  // change graphql_deployment_version when switching
  enable_api_auth = local.INFRA_ENV_VAR.ENABLE_API_AUTH.default

  // change value to deploy api
  graphql_deployment_version     = 1
  apigw_authorization_header_key = "Authorization"

  // apigw v2
  enable_api_auto_deploy = true

  ############### client ###############

  client_origin_bucket_name = "${local.ORIGIN_PREFIX}-${local.ID_ENV}"
}

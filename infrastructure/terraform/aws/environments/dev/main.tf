locals {
  APP              = "mxfactorial"
  ENV              = "dev"
  APP_ENV          = "${local.APP}-${local.ENV}"
  PROJECT_JSON     = jsondecode(file("../../../../../project.json"))
  ORIGIN_PREFIX    = local.PROJECT_JSON.client_origin_bucket_name_prefix
  ARTIFACTS_PREFIX = local.PROJECT_JSON.artifacts_bucket_name_prefix
  TFSTATE_PREFIX   = local.PROJECT_JSON.tfstate_bucket_name_prefix
  RDS_PREFIX       = local.PROJECT_JSON.terraform.aws.rds.instance_name_prefix
  REGION           = local.PROJECT_JSON.region
  ENV_ID           = jsondecode(file("../../../env-id/terraform.tfstate")).outputs.env_id.value
  ID_ENV           = "${local.ENV_ID}-${local.ENV}"
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
  build_db_and_cache    = local.PROJECT_JSON.terraform.aws.build_db_and_cache // false during terraform development

  ############### ssm ###############

  ssm_prefix = "${local.ENV_ID}/${local.PROJECT_JSON.ssm_version}/${local.ENV}"

  ############### lambda ###############

  requests_by_account_return_limit     = 20
  transactions_by_account_return_limit = 20
  notifications_return_limit           = 20
  initial_account_balance              = 1000

  ############### rds ###############

  rds_allow_major_version_upgrade = true
  rds_instance_class              = "db.t3.micro"
  rds_parameter_group             = "default.postgres13"
  rds_instance_name               = "${local.RDS_PREFIX}-${local.ID_ENV}"
  db_snapshot_id                  = null

  ############### api gateway ###############

  // change graphql_deployment_version when switching
  enable_api_auth = local.PROJECT_JSON.enable_api_auth

  // change value to deploy api
  graphql_deployment_version     = 1
  apigw_authorization_header_key = "Authorization"

  // apigw v2
  enable_api_auto_deploy = true

  ############### notifications ###############

  enable_notifications = local.PROJECT_JSON.enable_notifications

  ############### client ###############

  client_origin_bucket_name = "${local.ORIGIN_PREFIX}-${local.ID_ENV}"
}

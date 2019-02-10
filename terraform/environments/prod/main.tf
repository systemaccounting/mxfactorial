terraform {
  required_version = ">= 0.11.8"

  backend "s3" {
    encrypt = true
    bucket  = "prod-mxfactorial-tf-state"

    // CHANGE ENVIRONMENT HERE
    dynamodb_table = "prod-mxfactorial-tf-state"
    region         = "us-east-1"

    // CHANGE ENVIRONMENT HERE
    key = "prod-mxfactorial.tfstate"
  }
}

# tear down without output errors
# TF_WARN_OUTPUT_ERRORS=1 terraform destroy --auto-approve

provider "aws" {
  region = "us-east-1"

  # user regions where only cloud9 available
  # https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/
}

data "terraform_remote_state" "global" {
  backend = "s3"

  config {
    bucket = "global-mxfactorial-tf-state"
    key    = "global-mxfactorial.tfstate"
    region = "us-east-1"
  }
}

module "prod" {
  source = "../../modules/environment"

  ############### Shared ###############
  environment = "${var.environment}"

  ############### Shared in Lambda and RDS ###############
  db_master_username = "${var.db_master_username}"
  db_master_password = "${var.db_master_password}"

  ############### API Gateway ###############
  certificate_arn = "${lookup(data.terraform_remote_state.global.api_cert_map, var.environment)}"

  api_name             = "mxfactorial-api-${var.environment}"
  stage_name           = "${var.environment}"
  domain_name          = "${"${var.environment}" == "prod" ?  "api.mxfactorial.io" : "${var.environment}-api.mxfactorial.io"}"
  iam_role_name        = "mxfactorial-cloudwatch-role-${var.environment}"
  iam_role_policy_name = "mxfactorial-cloudwatch-policy-${var.environment}"

  ############### Batch ###############
  aws_batch_job_queue_name            = "liquibase-${var.environment}"
  aws_batch_job_definition_name       = "liquibase-${var.environment}"
  batch_ecs_instance_role_name        = "batch-ecs-instance-role-${var.environment}"
  batch_aws_iam_instance_profile_name = "batch-aws-iam-instance-profile-${var.environment}"
  aws_batch_service_role_name         = "aws-batch-service-role-${var.environment}"
  aws_batch_compute_environment_name  = "batch-compute-environment-${var.environment}"
  liquibase_job_definition_role_name  = "liquibase-job-definition-role-${var.environment}"

  ############### Cloudfront ###############
  domain_aliases = ["${"${var.environment}" == "prod" ?  "mxfactorial.io" : "${var.environment}.mxfactorial.io"}"]
  ssl_arn        = "${lookup(data.terraform_remote_state.global.client_cert_map, var.environment)}"

  ############### Cognito ###############
  faker_lambda_region_env_var = "${var.region}"

  ############### Lambda ###############
  graphql_lambda_function_name  = "mxfactorial-graphql-server-${var.environment}"
  graphql_lambda_region_env_var = "${var.region}"
  graphql_lambda_role_name      = "mxfactorial-graphql-lambda-${var.environment}"
  graphql_lambda_policy_name    = "mxfactorial-graphql-lambda-${var.environment}"

  ############### RDS ###############
  db_cluster_identifier                      = "mxfactorial-${var.environment}"
  cloud9_name                                = "rds-connect-${var.environment}"
  integration_test_data_teardown_lambda_name = "delete-faker-rds-transactions-lambda-${var.environment}"

  ############### Route 53 ###############
  client_fqdn = "${"${var.environment}" == "prod" ?  "mxfactorial.io" : "${var.environment}.mxfactorial.io"}"
  api_fqdn    = "${"${var.environment}" == "prod" ?  "api.mxfactorial.io" : "${var.environment}-api.mxfactorial.io"}"

  ############### S3 ###############
  react_bucket_name = "mxfactorial-react-${var.environment}"
}

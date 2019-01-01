module "lambda" {
  source                        = "../modules/lambda"
  graphql_lambda_function_name  = "mxfactorial-graphql-server-${terraform.workspace}"
  graphql_lambda_region_env_var = "${lookup(var.region, "${terraform.workspace}")}"
  rds_endpoint                  = "${module.rds.rds_endpoint}"
  db_master_username            = "${var.db_master_username}"
  db_master_password            = "${var.db_master_password}"
  graphql_lambda_role_name      = "mxfactorial-graphql-lambda-${terraform.workspace}"
  graphql_lambda_policy_name    = "mxfactorial-graphql-lambda-${terraform.workspace}"
}

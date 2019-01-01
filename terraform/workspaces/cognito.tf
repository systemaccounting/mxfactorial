module "cognito" {
  source                      = "../modules/cognito"
  environment                 = "${terraform.workspace}"
  faker_lambda_region_env_var = "${lookup(var.region, "${terraform.workspace}")}"
}

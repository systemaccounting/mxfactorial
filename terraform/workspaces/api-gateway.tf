module "api_gateway" {
  source = "../modules/api-gateway"

  graphql_server_invoke_arn    = "${module.lambda.graphql_lambda_function_arn}"
  graphql_server_function_name = "${module.lambda.graphql_lambda_function_name}"
  certificate_arn              = "${lookup("${null_resource.api_cert_arns.triggers}", "${terraform.workspace}")}"
  api_name                     = "mxfactorial-api-${terraform.workspace}"
  stage_name                   = "${terraform.workspace}"
  domain_name                  = "${"${terraform.workspace}" == "prod" ?  "api.mxfactorial.io" : "${terraform.workspace}-api.mxfactorial.io"}"
  iam_role_name                = "mxfactorial-cloudwatch-role-${terraform.workspace}"
  iam_role_policy_name         = "mxfactorial-cloudwatch-policy-${terraform.workspace}"
}

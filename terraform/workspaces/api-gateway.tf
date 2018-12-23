module "api_gateway" {
  source = "git::https://github.com/systemaccounting/mxfactorial.git//terraform/modules/api-gateway?ref=terraform-api-gateway-module"

  graphql_server_arn = "${aws_lambda_function.mxfactorial_graphql_server.invoke_arn}"
  graphql_server_function_name = "${aws_lambda_function.mxfactorial_graphql_server.function_name}"
  certificate_arn = "${lookup("${null_resource.api_cert_arns.triggers}", "${terraform.workspace}")}"
}

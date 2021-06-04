locals {
  APIV2_NAME = "graphql-${var.env}"
  APIV2_URI  = "${var.env == "prod" ? "" : "${var.env}-"}api.mxfactorial.io"
}

module "graphql_apigwv2" {
  source                   = "../apigwv2-lambda"
  api_name                 = local.APIV2_NAME
  payload_format_version   = "1.0"
  enable_api_auth          = false
  api_version              = 001
  env                      = var.env
  lambda_invoke_arn        = aws_lambda_function.graphql.invoke_arn
  enable_api_auto_deploy   = var.enable_api_auto_deploy
  cognito_client_id        = aws_cognito_user_pool_client.client.id
  cognito_endpoint         = aws_cognito_user_pool.pool.endpoint
  authorization_header_key = var.apigw_authorization_header_key
}

module "graphql_apigwv2_dns" {
  source                = "../apigwv2-dns"
  apigwv2_custom_domain = local.APIV2_URI
  apigwv2_id            = module.graphql_apigwv2.api_id
  apigwv2_stage_id      = module.graphql_apigwv2.stage_id
  acm_cert_arn          = var.certificate_arn
  route53_zone_id       = data.aws_route53_zone.mxfactorial_io.zone_id
}

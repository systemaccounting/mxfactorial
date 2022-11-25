module "graphql_apigwv2" {
  source                   = "../../apigwv2-lambda/v001"
  api_name                 = "graphql-${local.ID_ENV}"
  payload_format_version   = "2.0"
  enable_api_auth          = var.enable_api_auth
  api_version              = 001
  env                      = var.env
  lambda_invoke_arn        = aws_lambda_function.graphql.invoke_arn
  enable_api_auto_deploy   = var.enable_api_auto_deploy
  cognito_client_id        = aws_cognito_user_pool_client.client.id
  cognito_endpoint         = aws_cognito_user_pool.pool.endpoint
  authorization_header_key = var.apigw_authorization_header_key
}

module "graphql_apigwv2_dns" {
  count                 = var.custom_domain_name == "" ? 0 : 1
  source                = "../../apigwv2-dns/v001"
  apigwv2_custom_domain = var.custom_domain_name == "" ? null : (var.env == "prod" ? "api.${var.custom_domain_name}" : "${var.env}-api.${var.custom_domain_name}")
  apigwv2_id            = module.graphql_apigwv2.api_id
  apigwv2_stage_id      = "$default"
  acm_cert_arn          = var.custom_domain_name == "" ? null : var.api_cert_arn
  route53_zone_id       = var.custom_domain_name == "" ? null : join("", data.aws_route53_zone.default.*.zone_id)
}

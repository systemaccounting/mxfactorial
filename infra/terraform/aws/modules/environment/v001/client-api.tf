module "client_apigwv2" {
  source                   = "../../apigwv2-lambda/v001"
  api_name                 = "client-${local.ID_ENV}"
  payload_format_version   = "2.0"
  enable_api_auth          = false // client always public
  api_version              = 001
  env                      = var.env
  lambda_invoke_arn        = module.client.lambda_invoke_arn
  enable_api_auto_deploy   = var.enable_api_auto_deploy
  cognito_client_id        = aws_cognito_user_pool_client.client.id
  cognito_endpoint         = null
  authorization_header_key = null
  # apigwv2_logging_level   = var.apigwv2_logging_level
  apigwv2_burst_limit = var.apigwv2_burst_limit
  apigwv2_rate_limit  = var.apigwv2_rate_limit
}

module "client_apigwv2_dns" {
  count                 = var.custom_domain_name == "" ? 0 : 1
  source                = "../../apigwv2-dns/v001"
  apigwv2_custom_domain = var.custom_domain_name == "" ? null : var.env == "prod" ? var.custom_domain_name : "${var.env}.${var.custom_domain_name}"
  apigwv2_id            = module.client_apigwv2.api_id
  apigwv2_stage_id      = "$default"
  acm_cert_arn          = var.custom_domain_name == "" ? null : var.client_cert_arn
  route53_zone_id       = var.custom_domain_name == "" ? null : join("", data.aws_route53_zone.default.*.zone_id)
}

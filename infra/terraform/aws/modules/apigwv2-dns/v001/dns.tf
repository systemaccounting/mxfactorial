resource "aws_apigatewayv2_domain_name" "default" {
  domain_name = var.apigwv2_custom_domain
  domain_name_configuration {
    certificate_arn = var.acm_cert_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "default" {
  api_id      = var.apigwv2_id
  domain_name = aws_apigatewayv2_domain_name.default.id
  stage       = var.apigwv2_stage_id
}

resource "aws_route53_record" "default_fqdn" {
  zone_id = var.route53_zone_id
  name    = var.apigwv2_custom_domain
  type    = "A"
  alias {
    name                   = aws_apigatewayv2_domain_name.default.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.default.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "default_fqdn_ipv6" {
  zone_id = var.route53_zone_id
  name    = var.apigwv2_custom_domain
  type    = "AAAA"
  alias {
    name                   = aws_apigatewayv2_domain_name.default.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.default.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

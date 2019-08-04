resource "aws_route53_record" "client_fqdn" {
  zone_id = data.aws_route53_zone.mxfactorial_io.zone_id
  name    = var.environment == "prod" ?  "mxfactorial.io" : "${var.environment}.mxfactorial.io"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_react_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_react_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "client_fqdn_ipv6" {
  zone_id = data.aws_route53_zone.mxfactorial_io.zone_id
  name    = var.environment == "prod" ?  "mxfactorial.io" : "${var.environment}.mxfactorial.io"
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.s3_react_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_react_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api_fqdn" {
  zone_id = "${data.aws_route53_zone.mxfactorial_io.zone_id}"

  name = var.environment == "prod" ?  "api.mxfactorial.io" : "${var.environment}-api.mxfactorial.io"
  type = "A"

  alias {
    name                   = aws_api_gateway_domain_name.mxfactorial.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.mxfactorial.cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api_fqdn_ipv6" {
  zone_id = data.aws_route53_zone.mxfactorial_io.zone_id

  name = var.environment == "prod" ?  "api.mxfactorial.io" : "${var.environment}-api.mxfactorial.io"
  type = "AAAA"

  alias {
    name                   = aws_api_gateway_domain_name.mxfactorial.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.mxfactorial.cloudfront_zone_id
    evaluate_target_health = false
  }
}

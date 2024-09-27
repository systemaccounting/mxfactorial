data "aws_route53_zone" "default" {
  count = var.custom_domain_name == "" ? 0 : 1
  name  = "${var.custom_domain_name}."
}

resource "aws_route53_record" "client_fqdn" {
  count   = var.custom_domain_name == "" ? 0 : 1
  zone_id = var.custom_domain_name == "" ? null : join("", data.aws_route53_zone.default.*.zone_id)
  name    = var.custom_domain_name == "" ? null : (var.env == "prod" ? var.custom_domain_name : "${var.env}.${var.custom_domain_name}")
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_client_distribution[0].domain_name
    zone_id                = aws_cloudfront_distribution.s3_client_distribution[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "client_fqdn_ipv6" {
  count   = var.custom_domain_name == "" ? 0 : 1
  zone_id = var.custom_domain_name == "" ? null : join("", data.aws_route53_zone.default.*.zone_id)
  name    = var.custom_domain_name == "" ? null : (var.env == "prod" ? var.custom_domain_name : "${var.env}.${var.custom_domain_name}")
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.s3_client_distribution[0].domain_name
    zone_id                = aws_cloudfront_distribution.s3_client_distribution[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "client_fqdn" {
  zone_id = data.aws_route53_zone.mxfactorial_io.zone_id
  name    = local.client_url
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_react_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_react_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "client_fqdn_ipv6" {
  zone_id = data.aws_route53_zone.mxfactorial_io.zone_id
  name    = local.client_url
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.s3_react_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_react_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

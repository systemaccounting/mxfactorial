data "aws_route53_zone" "mxfactorial_io" {
  name = "mxfactorial.io."
}

resource "aws_route53_record" "client_fqdn" {
  zone_id = "${data.aws_route53_zone.mxfactorial_io.zone_id}"
  name    = "${var.client_fqdn}"
  type    = "A"

  alias {
    name                   = "${var.cloudfront_s3_react_domain_name}"
    zone_id                = "${var.cloudfront_s3_react_hosted_zome_id}"
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "client_fqdn_ipv6" {
  zone_id = "${data.aws_route53_zone.mxfactorial_io.zone_id}"
  name    = "${var.client_fqdn}"
  type    = "AAAA"

  alias {
    name                   = "${var.cloudfront_s3_react_domain_name}"
    zone_id                = "${var.cloudfront_s3_react_hosted_zome_id}"
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api_fqdn" {
  zone_id = "${data.aws_route53_zone.mxfactorial_io.zone_id}"

  name = "${var.api_fqdn}"
  type = "A"

  alias {
    name                   = "${var.api_alias_name}"
    zone_id                = "${var.api_alias_zone_id}"
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api_fqdn_ipv6" {
  zone_id = "${data.aws_route53_zone.mxfactorial_io.zone_id}"

  name = "${var.api_fqdn}"
  type = "AAAA"

  alias {
    name                   = "${var.api_alias_name}"
    zone_id                = "${var.api_alias_zone_id}"
    evaluate_target_health = false
  }
}

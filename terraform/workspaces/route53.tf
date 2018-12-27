data "aws_route53_zone" "mxfactorial_io" {
  name = "mxfactorial.io."
}

resource "aws_route53_record" "client_fqdn" {
  zone_id = "${data.aws_route53_zone.mxfactorial_io.zone_id}"
  name    = "${"${terraform.workspace}" == "prod" ?  "${data.aws_route53_zone.mxfactorial_io.name}" : "${terraform.workspace}.${data.aws_route53_zone.mxfactorial_io.name}"}"
  type    = "A"

  alias {
    name                   = "${module.cloudfront.s3_react_distribution_domain_name}"
    zone_id                = "${module.cloudfront.s3_react_distribution_hosted_zone_id}"
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "client_fqdn_ipv6" {
  zone_id = "${data.aws_route53_zone.mxfactorial_io.zone_id}"
  name    = "${"${terraform.workspace}" == "prod" ?  "${data.aws_route53_zone.mxfactorial_io.name}" : "${terraform.workspace}.${data.aws_route53_zone.mxfactorial_io.name}"}"
  type    = "AAAA"

  alias {
    name                   = "${module.cloudfront.s3_react_distribution_domain_name}"
    zone_id                = "${module.cloudfront.s3_react_distribution_hosted_zone_id}"
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api_fqdn" {
  zone_id = "${data.aws_route53_zone.mxfactorial_io.zone_id}"

  name = "${"${terraform.workspace}" == "prod" ?  "api.${data.aws_route53_zone.mxfactorial_io.name}" : "${terraform.workspace}-api.${data.aws_route53_zone.mxfactorial_io.name}"}"
  type = "A"

  alias {
    name                   = "${module.api_gateway.cloudfront_domain_name}"
    zone_id                = "${module.api_gateway.cloudfront_zone_id}"
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api_fqdn_ipv6" {
  zone_id = "${data.aws_route53_zone.mxfactorial_io.zone_id}"

  name = "${"${terraform.workspace}" == "prod" ?  "api.${data.aws_route53_zone.mxfactorial_io.name}" : "${terraform.workspace}-api.${data.aws_route53_zone.mxfactorial_io.name}"}"
  type = "AAAA"

  alias {
    name                   = "${module.api_gateway.cloudfront_domain_name}"
    zone_id                = "${module.api_gateway.cloudfront_zone_id}"
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_client_fqdn" {
  //add for www-prefix distribution on prod only
  count   = "${"${terraform.workspace}" == "prod" ?  1 : 0}"
  zone_id = "${data.aws_route53_zone.mxfactorial_io.zone_id}"
  name    = "www.${data.aws_route53_zone.mxfactorial_io.name}"
  type    = "A"

  alias {
    name                   = "${aws_cloudfront_distribution.s3_react_www_distribution.domain_name}"
    zone_id                = "${aws_cloudfront_distribution.s3_react_www_distribution.hosted_zone_id}"
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_client_fqdn_ipv6" {
  //add for www-prefix distribution on prod only
  count   = "${"${terraform.workspace}" == "prod" ?  1 : 0}"
  zone_id = "${data.aws_route53_zone.mxfactorial_io.zone_id}"
  name    = "www.mxfactorial.io."
  type    = "AAAA"

  alias {
    name                   = "${aws_cloudfront_distribution.s3_react_www_distribution.domain_name}"
    zone_id                = "${aws_cloudfront_distribution.s3_react_www_distribution.hosted_zone_id}"
    evaluate_target_health = false
  }
}

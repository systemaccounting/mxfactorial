module "dns" {
  source                             = "../modules/route53"
  client_fqdn                        = "${"${terraform.workspace}" == "prod" ?  "mxfactorial.io" : "${terraform.workspace}.mxfactorial.io"}"
  api_fqdn                           = "${"${terraform.workspace}" == "prod" ?  "api.mxfactorial.io" : "${terraform.workspace}-api.mxfactorial.io"}"
  api_alias_name                     = "${module.api_gateway.cloudfront_domain_name}"
  api_alias_zone_id                  = "${module.api_gateway.cloudfront_zone_id}"
  cloudfront_s3_react_domain_name    = "${module.cloudfront.s3_react_distribution_domain_name}"
  cloudfront_s3_react_hosted_zome_id = "${module.cloudfront.s3_react_distribution_hosted_zone_id}"
}

resource "aws_route53_record" "www_client_fqdn" {
  //add for www-prefix distribution on prod only
  count   = "${"${terraform.workspace}" == "prod" ?  1 : 0}"
  zone_id = "${data.aws_route53_zone.www_mxfactorial_io.zone_id}"
  name    = "www.mxfactorial.io"
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
  zone_id = "${data.aws_route53_zone.www_mxfactorial_io.zone_id}"
  name    = "www.mxfactorial.io."
  type    = "AAAA"

  alias {
    name                   = "${aws_cloudfront_distribution.s3_react_www_distribution.domain_name}"
    zone_id                = "${aws_cloudfront_distribution.s3_react_www_distribution.hosted_zone_id}"
    evaluate_target_health = false
  }
}

data "aws_route53_zone" "www_mxfactorial_io" {
  name = "mxfactorial.io."
}

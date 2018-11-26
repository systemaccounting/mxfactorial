// provisioned manually
data "aws_route53_zone" "mxfactorial_io" {
  name = "mxfactorial.io."
}

######### Request www cert individually to avoid complex config ##########
resource "aws_acm_certificate" "client_www_cert" {
  domain_name       = "www.mxfactorial.io"
  validation_method = "DNS"

  tags {
    environment = "prod"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "client_www_cert_validation" {
  name    = "${aws_acm_certificate.client_www_cert.domain_validation_options.0.resource_record_name}"
  type    = "${aws_acm_certificate.client_www_cert.domain_validation_options.0.resource_record_type}"
  zone_id = "${data.aws_route53_zone.mxfactorial_io.zone_id}"

  records = [
    "${aws_acm_certificate.client_www_cert.domain_validation_options.0.resource_record_value}",
  ]

  ttl = 300
}

resource "aws_acm_certificate_validation" "client_www_cert" {
  certificate_arn = "${aws_acm_certificate.client_www_cert.arn}"

  validation_record_fqdns = [
    "${aws_route53_record.client_www_cert_validation.fqdn}",
  ]
}

######### Request client certs for all envs; count > 1  ##########
resource "aws_acm_certificate" "client_cert" {
  count             = "${length(var.environments)}"
  domain_name       = "${var.environments[count.index] == "prod" ?  "mxfactorial.io" : "${var.environments[count.index]}.mxfactorial.io"}"
  validation_method = "DNS"

  tags {
    environment = "${element(var.environments, count.index)}"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "client_cert_validation" {
  count   = "${length(var.environments)}"
  name    = "${element(aws_acm_certificate.client_cert.*.domain_validation_options.0.resource_record_name, count.index)}"
  type    = "${element(aws_acm_certificate.client_cert.*.domain_validation_options.0.resource_record_type, count.index)}"
  zone_id = "${data.aws_route53_zone.mxfactorial_io.zone_id}"

  records = [
    "${element(aws_acm_certificate.client_cert.*.domain_validation_options.0.resource_record_value, count.index)}",
  ]

  ttl = 300
}

resource "aws_acm_certificate_validation" "client_cert" {
  count           = "${length(var.environments)}"
  certificate_arn = "${element(aws_acm_certificate.client_cert.*.arn, count.index)}"

  validation_record_fqdns = [
    "${element(aws_route53_record.client_cert_validation.*.fqdn, count.index)}",
  ]
}

######### Request api certs for all envs; count > 1  ##########
resource "aws_acm_certificate" "api_cert" {
  count = "${length(var.environments)}"

  domain_name       = "${element(var.environments, count.index) == "prod" ?  "api.mxfactorial.io" : "${element(var.environments, count.index)}-api.mxfactorial.io"}"
  validation_method = "DNS"

  tags {
    environment = "${element(var.environments, count.index)}"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "api_cert_validation" {
  count   = "${length(var.environments)}"
  name    = "${element(aws_acm_certificate.api_cert.*.domain_validation_options.0.resource_record_name, count.index)}"
  type    = "${element(aws_acm_certificate.api_cert.*.domain_validation_options.0.resource_record_type, count.index)}"
  zone_id = "${data.aws_route53_zone.mxfactorial_io.zone_id}"

  records = [
    "${element(aws_acm_certificate.api_cert.*.domain_validation_options.0.resource_record_value, count.index)}",
  ]

  ttl = 300
}

resource "aws_acm_certificate_validation" "api_cert" {
  count           = "${length(var.environments)}"
  certificate_arn = "${element(aws_acm_certificate.api_cert.*.arn, count.index)}"

  validation_record_fqdns = [
    "${element(aws_route53_record.api_cert_validation.*.fqdn, count.index)}",
  ]
}

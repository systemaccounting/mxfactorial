// provisioned manually
data "aws_route53_zone" "default" {
  name = "${var.custom_domain_name}."
}

resource "aws_acm_certificate" "client_cert" {
  domain_name       = var.env == "prod" ? var.custom_domain_name : "${var.env}.${var.custom_domain_name}"
  validation_method = "DNS"

  tags = {
    environment = var.env
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "client_cert_validation" {
  name    = tolist(aws_acm_certificate.client_cert.domain_validation_options)[0].resource_record_name
  type    = tolist(aws_acm_certificate.client_cert.domain_validation_options)[0].resource_record_type
  zone_id = data.aws_route53_zone.default.zone_id

  records = [
    tolist(aws_acm_certificate.client_cert.domain_validation_options)[0].resource_record_value,
  ]

  ttl = 300
}

resource "aws_acm_certificate_validation" "client_cert" {
  certificate_arn = aws_acm_certificate.client_cert.arn

  validation_record_fqdns = [
    aws_route53_record.client_cert_validation.fqdn,
  ]
}

resource "aws_acm_certificate" "api_cert" {
  domain_name       = var.env == "prod" ? "api.${var.custom_domain_name}" : "${var.env}-api.${var.custom_domain_name}"
  validation_method = "DNS"

  tags = {
    environment = var.env
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "api_cert_validation" {
  name    = tolist(aws_acm_certificate.api_cert.domain_validation_options)[0].resource_record_name
  type    = tolist(aws_acm_certificate.api_cert.domain_validation_options)[0].resource_record_type
  zone_id = data.aws_route53_zone.default.zone_id

  records = [
    tolist(aws_acm_certificate.api_cert.domain_validation_options)[0].resource_record_value,
  ]

  ttl = 300
}

resource "aws_acm_certificate_validation" "api_cert" {
  certificate_arn = aws_acm_certificate.api_cert.arn

  validation_record_fqdns = [
    aws_route53_record.api_cert_validation.fqdn,
  ]
}

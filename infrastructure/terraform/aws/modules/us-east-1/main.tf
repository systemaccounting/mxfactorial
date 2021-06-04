// provisioned manually
data "aws_route53_zone" "mxfactorial_io" {
  name = "mxfactorial.io."
}

resource "aws_acm_certificate" "client_cert" {
  domain_name       = var.env == "prod" ? "mxfactorial.io" : "${var.env}.mxfactorial.io"
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
  zone_id = data.aws_route53_zone.mxfactorial_io.zone_id

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
  domain_name       = var.env == "prod" ? "api.mxfactorial.io" : "${var.env}-api.mxfactorial.io"
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
  zone_id = data.aws_route53_zone.mxfactorial_io.zone_id

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

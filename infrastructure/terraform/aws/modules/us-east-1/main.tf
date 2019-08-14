// provisioned manually
data "aws_route53_zone" "mxfactorial_io" {
  name = "mxfactorial.io."
}

resource "aws_acm_certificate" "client_cert" {
  domain_name       = var.environment == "prod" ?  "mxfactorial.io" : "${var.environment}.mxfactorial.io"
  validation_method = "DNS"

  tags = {
    environment = var.environment
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "client_cert_validation" {
  name    = aws_acm_certificate.client_cert.domain_validation_options.0.resource_record_name
  type    = aws_acm_certificate.client_cert.domain_validation_options.0.resource_record_type
  zone_id = data.aws_route53_zone.mxfactorial_io.zone_id

  records = [
    aws_acm_certificate.client_cert.domain_validation_options.0.resource_record_value,
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
  domain_name       = var.environment == "prod" ?  "api.mxfactorial.io" : "${var.environment}-api.mxfactorial.io"
  validation_method = "DNS"

  tags = {
    environment = var.environment
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "api_cert_validation" {
  name    = aws_acm_certificate.api_cert.domain_validation_options.0.resource_record_name
  type    = aws_acm_certificate.api_cert.domain_validation_options.0.resource_record_type
  zone_id = data.aws_route53_zone.mxfactorial_io.zone_id

  records = [
    aws_acm_certificate.api_cert.domain_validation_options.0.resource_record_value,
  ]

  ttl = 300
}

resource "aws_acm_certificate_validation" "api_cert" {
  certificate_arn = aws_acm_certificate.api_cert.arn

  validation_record_fqdns = [
    aws_route53_record.api_cert_validation.fqdn,
  ]
}

// provisioned manually
data "aws_route53_zone" "mxfactorial_io" {
  name = "mxfactorial.io."
}

######### Request www cert for PROD separately for readability ##########
resource "aws_acm_certificate" "client_www_cert" {
  domain_name       = "www.mxfactorial.io"
  validation_method = "DNS"

  tags = {
    environment = "prod"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "client_www_cert_validation" {
  name    = aws_acm_certificate.client_www_cert.domain_validation_options[0].resource_record_name
  type    = aws_acm_certificate.client_www_cert.domain_validation_options[0].resource_record_type
  zone_id = data.aws_route53_zone.mxfactorial_io.zone_id

  records = [aws_acm_certificate.client_www_cert.domain_validation_options[0].resource_record_value]

  ttl = 300
}

resource "aws_acm_certificate_validation" "client_www_cert" {
  certificate_arn         = aws_acm_certificate.client_www_cert.arn
  validation_record_fqdns = [aws_route53_record.client_www_cert_validation.fqdn]
}

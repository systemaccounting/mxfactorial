output "client_cert_prod" {
  value = module.acm_certs_prod.client_cert
}

output "api_cert_prod" {
  value = module.acm_certs_prod.api_cert
}

// prod only
output "client_www_cert" {
  value = aws_acm_certificate_validation.client_www_cert.certificate_arn
}

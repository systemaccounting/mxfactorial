output "client_cert_map" {
  value = {
    prod = module.prod_certs_and_artifact_storage.client_cert
    dev  = module.dev_certs_and_artifact_storage.client_cert
  }
}

output "api_cert_map" {
  value = {
    prod = module.prod_certs_and_artifact_storage.api_cert
    dev  = module.dev_certs_and_artifact_storage.api_cert
  }
}

// prod only
output "client_www_cert" {
  value = aws_acm_certificate_validation.client_www_cert.certificate_arn
}

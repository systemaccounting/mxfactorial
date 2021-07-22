output "client_cert_dev" {
  value = module.acm_certs_dev.client_cert
}

output "api_cert_dev" {
  value = module.acm_certs_dev.api_cert
}

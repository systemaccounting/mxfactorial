output "client_cert_map" {
  value = {
    prod = "${module.prod_certs.client_cert}"
    dev  = "${module.dev_certs.client_cert}"
    qa   = "${module.qa_certs.client_cert}"
  }
}

output "api_cert_map" {
  value = {
    prod = "${module.prod_certs.api_cert}"
    dev  = "${module.dev_certs.api_cert}"
    qa   = "${module.qa_certs.api_cert}"
  }
}

// prod only
output "client_www_cert" {
  value = "${aws_acm_certificate_validation.client_www_cert.certificate_arn}"
}

//sequenced according to var.environments

output "client_www_cert" {
  value = "${aws_acm_certificate_validation.client_www_cert.certificate_arn}"
}

output "client_certs" {
  value = "${aws_acm_certificate_validation.client_cert.*.certificate_arn}"
}

output "api_certs" {
  value = "${aws_acm_certificate_validation.api_cert.*.certificate_arn}"
}

output "client_cert" {
  value = "${aws_acm_certificate_validation.client_cert.certificate_arn}"
}

output "api_cert" {
  value = "${aws_acm_certificate_validation.api_cert.certificate_arn}"
}

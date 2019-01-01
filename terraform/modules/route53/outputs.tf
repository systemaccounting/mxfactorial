output "api" {
  value = "${aws_route53_record.api_fqdn.name}"
}

output "client" {
  value = "${aws_route53_record.client_fqdn.name}"
}

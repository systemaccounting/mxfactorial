output "pool_id" {
  value = "${aws_cognito_user_pool.pool.id}"
}

output "pool_client_id" {
  value = "${aws_cognito_user_pool_client.client.id}"
}

output "client" {
  value = "${aws_route53_record.client_fqdn.name}"
}

output "api" {
  value = "${aws_route53_record.api_fqdn.name}"
}

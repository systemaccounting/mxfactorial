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

output "s3_react_distribution_domain_name" {
  value = "${module.cloudfront.s3_react_distribution_domain_name}"
}

output "s3_react_distribution_hosted_zone_id" {
  value = "${module.cloudfront.s3_react_distribution}"
}

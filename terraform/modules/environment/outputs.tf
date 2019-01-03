output "react_bucket_regional_domain_name" {
  value = "${aws_s3_bucket.mxfactorial_react.bucket_regional_domain_name}"
}

output "react_bucket_id" {
  value = "${aws_s3_bucket.mxfactorial_react.id}"
}

output "api" {
  value = "${aws_route53_record.api_fqdn.name}"
}

output "client" {
  value = "${aws_route53_record.client_fqdn.name}"
}

output "rds_endpoint" {
  value = "${aws_rds_cluster.default.endpoint}"
}

output "graphql_lambda_function_name" {
  value = "${aws_lambda_function.mxfactorial_graphql_server.function_name}"
}

output "graphql_lambda_function_arn" {
  value = "${aws_lambda_function.mxfactorial_graphql_server.invoke_arn}"
}

output "pool_id" {
  value = "${aws_cognito_user_pool.pool.id}"
}

output "pool_client_id" {
  value = "${aws_cognito_user_pool_client.client.id}"
}

output "cache_id" {
  value = "${aws_cloudfront_distribution.s3_react_distribution.id}"
}

output "s3_react_distribution_domain_name" {
  value = "${aws_cloudfront_distribution.s3_react_distribution.domain_name}"
}

output "s3_react_distribution_hosted_zone_id" {
  value = "${aws_cloudfront_distribution.s3_react_distribution.hosted_zone_id}"
}

output "cloudfront_domain_name" {
  value = "${aws_api_gateway_domain_name.mxfactorial.cloudfront_domain_name}"
}

output "cloudfront_zone_id" {
  value = "${aws_api_gateway_domain_name.mxfactorial.cloudfront_zone_id}"
}

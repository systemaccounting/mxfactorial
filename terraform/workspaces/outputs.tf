output "base_url" {
  value = "${aws_api_gateway_deployment.environment.invoke_url}"
}

output "pool_id" {
  value = "${aws_cognito_user_pool.pool.id}"
}

output "pool_client_id" {
  value = "${aws_cognito_user_pool_client.client.id}"
}

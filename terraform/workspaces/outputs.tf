output "base_url" {
  value = "${aws_api_gateway_deployment.environment.invoke_url}"
}

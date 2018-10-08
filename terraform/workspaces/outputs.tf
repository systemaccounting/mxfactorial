output "base_url" {
  value = "${aws_api_gateway_deployment.prod.invoke_url}"
}

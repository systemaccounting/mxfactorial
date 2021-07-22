output "api_id" {
  value = aws_apigatewayv2_api.default.id
}

output "cloudwatch_arn" {
  value = aws_cloudwatch_log_group.default.arn
}

output "stage_id" {
  value = aws_apigatewayv2_stage.default.id
}

output "invoke_url" {
  value = aws_apigatewayv2_api.default.api_endpoint
}

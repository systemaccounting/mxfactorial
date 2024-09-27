// used only for depends_on in aws_apigatewayv2_deployment to avoid:
// "BadRequestException: At least one route is required before deploying the Api"
output "integration_id" {
  value = aws_apigatewayv2_integration.default.id
}

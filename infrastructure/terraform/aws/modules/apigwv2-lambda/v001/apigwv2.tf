locals {
  API_NAME_ENV = "${var.api_name}-${var.env}"
}

resource "aws_apigatewayv2_api" "default" {
  name          = local.API_NAME_ENV
  protocol_type = "HTTP"
  description   = "${var.api_name} api in ${var.env}"
  target        = var.lambda_invoke_arn

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = [
      "Content-Type",
      "X-Amz-Date",
      "Authorization",
      "X-Api-Key",
      "X-Amz-Security-Token",
    ]
    max_age = 300
  }
}

resource "aws_apigatewayv2_integration" "default" {
  api_id                 = aws_apigatewayv2_api.default.id
  integration_type       = "AWS_PROXY"
  connection_type        = "INTERNET"
  integration_method     = "POST"
  integration_uri        = var.lambda_invoke_arn
  timeout_milliseconds   = 30000
  payload_format_version = var.payload_format_version
}

resource "aws_apigatewayv2_route" "default" {
  count              = var.enable_api_auth ? 0 : 1
  api_id             = aws_apigatewayv2_api.default.id
  route_key          = "ANY /{proxy+}"
  authorization_type = "NONE"
  target             = "integrations/${aws_apigatewayv2_integration.default.id}"
}

resource "aws_apigatewayv2_route" "auth_enabled" {
  count              = var.enable_api_auth ? 1 : 0
  api_id             = aws_apigatewayv2_api.default.id
  route_key          = "ANY /{proxy+}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.default[0].id
  target             = "integrations/${aws_apigatewayv2_integration.default.id}"
}

resource "aws_apigatewayv2_authorizer" "default" {
  count            = var.enable_api_auth ? 1 : 0
  api_id           = aws_apigatewayv2_api.default.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.${var.authorization_header_key}"]
  name             = local.API_NAME_ENV

  jwt_configuration {
    audience = [var.cognito_client_id]
    issuer   = "https://${var.cognito_endpoint}"
  }
}

resource "aws_cloudwatch_log_group" "default" {
  name              = local.API_NAME_ENV
  retention_in_days = 30
}

resource "aws_lambda_permission" "default" {
  statement_id  = "AllowAPIGWLambdaInvoke${replace(title(local.API_NAME_ENV), "-", "")}"
  action        = "lambda:InvokeFunction"
  function_name = trimsuffix(split(":", var.lambda_invoke_arn)[11], "/invocations")
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.default.execution_arn}/*/*"
}

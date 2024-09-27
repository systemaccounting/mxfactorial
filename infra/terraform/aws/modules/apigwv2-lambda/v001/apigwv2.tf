resource "aws_apigatewayv2_api" "default" {
  name          = var.api_name
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

// https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html#http-api-cors-default-route
resource "aws_apigatewayv2_route" "enable_unauthorized_options" {
  count              = var.enable_api_auth ? 1 : 0
  api_id             = aws_apigatewayv2_api.default.id
  route_key          = "OPTIONS /{proxy+}"
  authorization_type = "NONE"
  target             = "integrations/${aws_apigatewayv2_integration.default.id}"
}

resource "aws_apigatewayv2_authorizer" "default" {
  count            = var.enable_api_auth ? 1 : 0
  api_id           = aws_apigatewayv2_api.default.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.${var.authorization_header_key}"]
  name             = var.api_name

  jwt_configuration {
    audience = [var.cognito_client_id]
    issuer   = "https://${var.cognito_endpoint}"
  }
}

resource "aws_cloudwatch_log_group" "default" {
  name              = var.api_name
  retention_in_days = 30
}

resource "aws_lambda_permission" "default" {
  statement_id  = "AllowAPIGWLambdaInvoke${replace(title(var.api_name), "-", "")}"
  action        = "lambda:InvokeFunction"
  function_name = trimsuffix(split(":", var.lambda_invoke_arn)[11], "/invocations")
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.default.execution_arn}/*/*"
}

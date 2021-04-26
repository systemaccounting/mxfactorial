locals {
  FIRST_OP_CHAR = substr(var.route_key, 0, 1)
  NO_DOLLAR = substr(var.route_key, 1, length(var.route_key)-1)
  OP_NAME = local.FIRST_OP_CHAR == "$" ? local.NO_DOLLAR : var.route_key
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = var.apiv2_id
  route_key = var.route_key
  operation_name = local.OP_NAME
  target = "integrations/${aws_apigatewayv2_integration.default.id}"
}

resource "aws_apigatewayv2_integration" "default" {
  api_id                        = var.apiv2_id
  integration_type              = "AWS_PROXY"
  description                   = "${var.route_key} integration in ${var.env}"
  integration_method            = "POST"
  integration_uri               = var.lambda_invoke_arn
  passthrough_behavior          = "WHEN_NO_MATCH"
}
resource "aws_api_gateway_rest_api" "rules" {
  name        = "rules-api-${var.environment}"
  description = "internal rules endpoint for ${var.environment}"

  endpoint_configuration {
    types = ["PRIVATE"]
  }

  policy = <<POLICY
  {
    "Version": "2012-10-17",
    "Statement": {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "execute-api:Invoke",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:sourceVpce": "${data.aws_vpc_endpoint.private-api.id}"
        }
      }
    }
  }
  POLICY
}

resource "aws_api_gateway_resource" "rules_proxy" {
  rest_api_id = aws_api_gateway_rest_api.rules.id
  parent_id   = aws_api_gateway_rest_api.rules.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "rules_proxy" {
  rest_api_id   = aws_api_gateway_rest_api.rules.id
  resource_id   = aws_api_gateway_resource.rules_proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "rules" {
  rest_api_id             = aws_api_gateway_rest_api.rules.id
  resource_id             = aws_api_gateway_method.rules_proxy.resource_id
  http_method             = aws_api_gateway_method.rules_proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.rules_service_lambda.invoke_arn
}

resource "aws_api_gateway_method" "rules_proxy_root" {
  rest_api_id   = aws_api_gateway_rest_api.rules.id
  resource_id   = aws_api_gateway_rest_api.rules.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "rules_proxy_root" {
  rest_api_id             = aws_api_gateway_rest_api.rules.id
  resource_id             = aws_api_gateway_method.rules_proxy_root.resource_id
  http_method             = aws_api_gateway_method.rules_proxy_root.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.rules_service_lambda.invoke_arn
}

resource "aws_api_gateway_deployment" "rules" {
  depends_on = [
    "aws_api_gateway_integration.rules",
    "aws_api_gateway_integration.rules_proxy_root",
  ]

  rest_api_id = aws_api_gateway_rest_api.rules.id
  stage_name  = var.environment
}

resource "aws_lambda_permission" "rules" {
  statement_id  = "AllowAPIGatewayInvokeRules"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rules_service_lambda.arn
  principal     = "apigateway.amazonaws.com"

  # The /*/* portion grants access from any method on any resource
  # within the API Gateway "REST API".
  source_arn = "${aws_api_gateway_deployment.rules.execution_arn}/*/*"
}

resource "aws_api_gateway_method_settings" "rules_settings" {
  rest_api_id = aws_api_gateway_rest_api.rules.id
  stage_name  = aws_api_gateway_deployment.rules.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled = true
    logging_level   = "INFO"
  }
}

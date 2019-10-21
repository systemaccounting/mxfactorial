resource "aws_api_gateway_rest_api" "mxfactorial_api" {
  name        = "mxfactorial-api-${var.environment}"
  description = "GraphQL Endpoint"
}

resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.mxfactorial_api.id
  parent_id   = aws_api_gateway_rest_api.mxfactorial_api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_authorizer" "api_authorizer" {
  name            = "cognito-pool-api-authorizer-${var.environment}"
  type            = "COGNITO_USER_POOLS"
  rest_api_id     = aws_api_gateway_rest_api.mxfactorial_api.id
  provider_arns   = [aws_cognito_user_pool.pool.arn]
  identity_source = "method.request.header.Authorization"
}

resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.mxfactorial_api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.api_authorizer.id
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = aws_api_gateway_rest_api.mxfactorial_api.id
  resource_id = aws_api_gateway_method.proxy.resource_id
  http_method = aws_api_gateway_method.proxy.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.mxfactorial_graphql_server.invoke_arn
}

resource "aws_api_gateway_method" "proxy_root" {
  rest_api_id   = aws_api_gateway_rest_api.mxfactorial_api.id
  resource_id   = aws_api_gateway_rest_api.mxfactorial_api.root_resource_id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.api_authorizer.id
}

resource "aws_api_gateway_integration" "lambda_root" {
  rest_api_id = aws_api_gateway_rest_api.mxfactorial_api.id
  resource_id = aws_api_gateway_method.proxy_root.resource_id
  http_method = aws_api_gateway_method.proxy_root.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.mxfactorial_graphql_server.invoke_arn
}

resource "aws_api_gateway_deployment" "environment" {
  depends_on = [
    "aws_api_gateway_integration.lambda",
    "aws_api_gateway_integration.lambda_root",
  ]

  stage_description = "deploy-001"
  rest_api_id       = aws_api_gateway_rest_api.mxfactorial_api.id
  stage_name        = var.environment

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lambda_permission" "mxfactorial_api_to_lambda" {
  statement_id  = "AllowAPIGatewayInvoke${title(var.environment)}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.mxfactorial_graphql_server.function_name
  principal     = "apigateway.amazonaws.com"

  # The /*/* portion grants access from any method on any resource
  # within the API Gateway "REST API".
  source_arn = "${aws_api_gateway_deployment.environment.execution_arn}/*/*"
}

resource "aws_api_gateway_account" "mxfactorial_api_account" {
  cloudwatch_role_arn = aws_iam_role.api_gateway_cloudwatch.arn
}

resource "aws_iam_role" "api_gateway_cloudwatch" {
  name = "api-gateway-role-${var.environment}"

  assume_role_policy = data.aws_iam_policy_document.api_gateway_cloudwatch_role.json
}

data "aws_iam_policy_document" "api_gateway_cloudwatch_role" {
  version = "2012-10-17"
  statement {
    sid    = "ApiGatewayRole${var.environment}"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role_policy" "api_gateway_cloudwatch" {
  name = "api-gateway-cloudwatch-policy-${var.environment}"
  role = aws_iam_role.api_gateway_cloudwatch.id

  policy = data.aws_iam_policy_document.api_gateway_cloudwatch_policy.json
}

data "aws_iam_policy_document" "api_gateway_cloudwatch_policy" {
  version = "2012-10-17"
  statement {
    sid    = "ApiGatewayCloudwatchPolicy${title(var.environment)}"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:PutLogEvents",
      "logs:GetLogEvents",
      "logs:FilterLogEvents"
    ]
    resources = ["*"]
  }
}

resource "aws_api_gateway_domain_name" "mxfactorial" {
  domain_name     = local.api_url
  certificate_arn = var.certificate_arn
}

resource "aws_api_gateway_base_path_mapping" "mxfactorial" {
  api_id      = aws_api_gateway_rest_api.mxfactorial_api.id
  stage_name  = aws_api_gateway_deployment.environment.stage_name
  domain_name = aws_api_gateway_domain_name.mxfactorial.domain_name
}

resource "aws_api_gateway_method" "resource_options" {
  rest_api_id   = aws_api_gateway_rest_api.mxfactorial_api.id
  resource_id   = aws_api_gateway_rest_api.mxfactorial_api.root_resource_id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "resource_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.mxfactorial_api.id
  resource_id = aws_api_gateway_rest_api.mxfactorial_api.root_resource_id
  http_method = aws_api_gateway_method.resource_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = <<PARAMS
 { "statusCode": 200 }
 PARAMS
  }
}

resource "aws_api_gateway_integration_response" "resource_options_integration_response" {
  depends_on  = ["aws_api_gateway_integration.resource_options_integration"]
  rest_api_id = aws_api_gateway_rest_api.mxfactorial_api.id
  resource_id = aws_api_gateway_rest_api.mxfactorial_api.root_resource_id
  http_method = aws_api_gateway_method.resource_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS,GET,PUT,PATCH,DELETE'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

resource "aws_api_gateway_method_response" "resource_options_200" {
  depends_on  = ["aws_api_gateway_method.resource_options"]
  rest_api_id = aws_api_gateway_rest_api.mxfactorial_api.id
  resource_id = aws_api_gateway_rest_api.mxfactorial_api.root_resource_id
  http_method = "OPTIONS"
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_settings" "graphql_settings" {
  rest_api_id = aws_api_gateway_rest_api.mxfactorial_api.id
  stage_name  = aws_api_gateway_deployment.environment.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled = true
    logging_level   = "INFO"
  }
}

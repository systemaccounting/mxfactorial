locals {
  DB_RESET = "db-reset"
}

resource "aws_sns_topic" "db_reset" {
  name = "${local.DB_RESET}-${var.environment}"
}

resource "aws_sns_topic_subscription" "sns_to_db_reset_lambda" {
  topic_arn = aws_sns_topic.db_reset.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.db_reset.arn
}

resource "aws_lambda_permission" "sns_to_db_reset_lambda" {
  statement_id  = "AllowASNSInvoke${title(var.environment)}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.db_reset.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.db_reset.arn
}

resource "aws_api_gateway_rest_api" "db_reset" {
  name        = "${local.DB_RESET}-${var.environment}"
  description = "${local.DB_RESET} api in ${var.environment}"
}

resource "aws_api_gateway_method" "db_reset" {
  rest_api_id   = aws_api_gateway_rest_api.db_reset.id
  resource_id   = aws_api_gateway_rest_api.db_reset.root_resource_id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "db_reset_sns" {
  rest_api_id             = aws_api_gateway_rest_api.db_reset.id
  resource_id             = aws_api_gateway_method.db_reset.resource_id
  http_method             = aws_api_gateway_method.db_reset.http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:sns:path//"
  credentials             = aws_iam_role.db_reset_api.arn
  request_templates = {
    "application/json" = "Action=Publish&TopicArn=$util.urlEncode('${aws_sns_topic.db_reset.arn}')&Message=$util.urlEncode($input.body)"
  }
  request_parameters = {
    "integration.request.header.Content-Type" = "'application/x-www-form-urlencoded'"
  }
}

resource "aws_api_gateway_integration_response" "integration_response_200" {
  rest_api_id       = aws_api_gateway_rest_api.db_reset.id
  resource_id       = aws_api_gateway_method.db_reset.resource_id
  http_method       = aws_api_gateway_method.db_reset.http_method
  status_code       = "200"
  selection_pattern = "200"
  response_templates = {
    "application/json" = jsonencode({
      statusCode = 200
      message    = "OK"
    })
  }
  depends_on = [
    aws_api_gateway_method.db_reset,
    aws_api_gateway_integration.db_reset_sns
  ]
}

resource "aws_api_gateway_integration_response" "integration_response_400" {
  rest_api_id       = aws_api_gateway_rest_api.db_reset.id
  resource_id       = aws_api_gateway_method.db_reset.resource_id
  http_method       = aws_api_gateway_method.db_reset.http_method
  status_code       = "400"
  selection_pattern = "4\\d{2}"
  response_templates = {
    "application/json" = jsonencode({
      statusCode = 400
      message    = "Error"
    })
  }
  depends_on = [
    aws_api_gateway_method.db_reset,
    aws_api_gateway_integration.db_reset_sns
  ]
}

resource "aws_api_gateway_deployment" "db_reset" {
  depends_on = [
    aws_api_gateway_integration.db_reset_sns,
  ]
  stage_description = "deploy-003"
  rest_api_id       = aws_api_gateway_rest_api.db_reset.id
  stage_name        = var.environment

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_iam_role" "db_reset_api" {
  name               = "${local.DB_RESET}-apigw-role-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.db_reset_api_role.json
}

data "aws_iam_policy_document" "db_reset_api_role" {
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

resource "aws_iam_role_policy" "db_reset_api" {
  name   = "${local.DB_RESET}-apigw-cw-policy-${var.environment}"
  role   = aws_iam_role.db_reset_api.id
  policy = data.aws_iam_policy_document.db_reset_api_policy.json
}

data "aws_iam_policy_document" "db_reset_api_policy" {
  version = "2012-10-17"
  statement {
    sid = "ApiGatewaySNSPolicy${title(var.environment)}"
    actions = [
      "sns:Publish",
    ]
    resources = [
      aws_sns_topic.db_reset.arn,
    ]
  }
}

resource "aws_api_gateway_method_response" "db_reset_200" {
  rest_api_id = aws_api_gateway_rest_api.db_reset.id
  resource_id = aws_api_gateway_rest_api.db_reset.root_resource_id
  http_method = aws_api_gateway_method.db_reset.http_method
  status_code = "200"
  depends_on = [
    aws_api_gateway_method.db_reset,
    aws_api_gateway_integration.db_reset_sns
  ]
}

resource "aws_api_gateway_method_response" "db_reset_400" {
  rest_api_id = aws_api_gateway_rest_api.db_reset.id
  resource_id = aws_api_gateway_rest_api.db_reset.root_resource_id
  http_method = aws_api_gateway_method.db_reset.http_method
  status_code = "400"
  depends_on = [
    aws_api_gateway_method.db_reset,
    aws_api_gateway_integration.db_reset_sns
  ]
}

resource "aws_api_gateway_method_settings" "db_reset_settings" {
  rest_api_id = aws_api_gateway_rest_api.db_reset.id
  stage_name  = aws_api_gateway_deployment.db_reset.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled = true
    logging_level   = "INFO"
  }
}

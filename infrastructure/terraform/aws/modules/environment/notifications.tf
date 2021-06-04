locals {
  // https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api.html
  APIGW_CONNECTIONS_URI = "https://${aws_apigatewayv2_api.notifications.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.env}"
  WEBSOCKET_CLIENT_URI  = "${aws_apigatewayv2_api.notifications.api_endpoint}/${var.env}/"
}

resource "aws_sns_topic" "notifications" {
  name = "notifications-${var.env}"
}

resource "aws_apigatewayv2_api" "notifications" {
  name                       = "notifications-wss-${var.env}"
  description                = "websocket in api in ${var.env}"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

resource "aws_apigatewayv2_stage" "notifications" {
  api_id        = aws_apigatewayv2_api.notifications.id
  name          = var.env
  description   = "wss api stage in ${var.env}"
  deployment_id = aws_apigatewayv2_deployment.notifications.id
  default_route_settings {
    throttling_rate_limit  = 10000
    throttling_burst_limit = 5000
    data_trace_enabled     = true
    logging_level          = "ERROR"
  }
}

resource "aws_apigatewayv2_deployment" "notifications" {
  api_id      = aws_apigatewayv2_api.notifications.id
  description = "wss notifications deployment in ${var.env}"
  triggers = {
    version = 1
  }
  lifecycle {
    create_before_destroy = true
  }
}

module "connect_route" {
  source            = "../apigwv2-route"
  env               = var.env
  apiv2_id          = aws_apigatewayv2_api.notifications.id
  route_key         = "$connect"
  lambda_invoke_arn = module.wss_connect.lambda_invoke_arn
}

module "getnotifications_route" {
  source            = "../apigwv2-route"
  env               = var.env
  apiv2_id          = aws_apigatewayv2_api.notifications.id
  route_key         = "getnotifications"
  lambda_invoke_arn = module.notifications_get.lambda_invoke_arn
}

module "clearnotifications_route" {
  source            = "../apigwv2-route"
  env               = var.env
  apiv2_id          = aws_apigatewayv2_api.notifications.id
  route_key         = "clearnotifications"
  lambda_invoke_arn = module.notifications_clear.lambda_invoke_arn
}

module "disconnect_route" {
  source            = "../apigwv2-route"
  env               = var.env
  apiv2_id          = aws_apigatewayv2_api.notifications.id
  route_key         = "$disconnect"
  lambda_invoke_arn = module.wss_connect.lambda_invoke_arn
}

resource "aws_apigatewayv2_route" "default" {
  api_id         = aws_apigatewayv2_api.notifications.id
  route_key      = "$default"
  operation_name = "default"
  target         = "integrations/${aws_apigatewayv2_integration.default.id}"
  # https://github.com/hashicorp/terraform-provider-aws/issues/17528#issuecomment-778278823
  route_response_selection_expression = "$default"
}

resource "aws_apigatewayv2_integration" "default" {
  api_id               = aws_apigatewayv2_api.notifications.id
  integration_type     = "MOCK"
  description          = "returns error describing available actions in ${var.env}"
  passthrough_behavior = "WHEN_NO_MATCH"
  request_templates = {
    "200" = "{\"statusCode\": 200}"
  }
  template_selection_expression = "200"
}

resource "aws_apigatewayv2_integration_response" "default" {
  api_id                   = aws_apigatewayv2_api.notifications.id
  integration_id           = aws_apigatewayv2_integration.default.id
  integration_response_key = aws_apigatewayv2_route.default.route_key
  response_templates = {
    "404" = "\"only getnotifications and clearnotifications actions available\""
  }
  template_selection_expression = "404"
}

resource "aws_apigatewayv2_route_response" "default" {
  api_id             = aws_apigatewayv2_api.notifications.id
  route_id           = aws_apigatewayv2_route.default.id
  route_response_key = aws_apigatewayv2_route.default.route_key
}

resource "aws_iam_policy" "wss" {
  name        = "allow-wss-stack-access-${var.env}"
  description = "allows lambda websocket stack perms in ${var.env}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "AllowAPIGatewayV2Invoke${title(var.env)}"
        Action = [
          "execute-api:ManageConnections",
          "execute-api:Invoke",
        ]
        Effect   = "Allow"
        Resource = "${aws_apigatewayv2_api.notifications.execution_arn}/${var.env}/*"
      },
      {
        Sid = "ListCognitoUserPools${title(var.env)}"
        Action = [
          "cognito-idp:ListUserPools",
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}

resource "aws_secretsmanager_secret" "apigw_connections_uri" {
  name                    = "${var.env}/APIGW_CONNECTIONS_URI"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "apigw_connections_uri" {
  secret_id     = aws_secretsmanager_secret.apigw_connections_uri.id
  secret_string = local.APIGW_CONNECTIONS_URI
}

resource "aws_secretsmanager_secret" "websocket_client_uri" {
  name                    = "${var.env}/WEBSOCKET_CLIENT_URI"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "websocket_client_uri" {
  secret_id     = aws_secretsmanager_secret.websocket_client_uri.id
  secret_string = local.WEBSOCKET_CLIENT_URI
}

resource "aws_secretsmanager_secret" "notifications_return_limit" {
  name                    = "${var.env}/NOTIFICATIONS_RETURN_LIMIT"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "notifications_return_limit" {
  secret_id     = aws_secretsmanager_secret.notifications_return_limit.id
  secret_string = var.notifications_return_limit
}

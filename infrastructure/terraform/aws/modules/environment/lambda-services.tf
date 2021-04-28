// modules require ${service_name}-src.zip
// in mxfactorial-artifacts-{var.env} s3

module "request_create" {
  source       = "../go-lambda-service"
  service_name = "request-create"
  env          = var.environment
  env_vars = merge(local.POSTGRES_VARS, {
    RULE_LAMBDA_ARN  = aws_lambda_function.rules.arn,
    NOTIFY_TOPIC_ARN = aws_sns_topic.notifications.arn,
  })
  attached_policy_arns = [aws_iam_policy.invoke_rules.arn]
  invoke_principals    = ["sns.amazonaws.com"]
  create_secret        = true // suppports local testing
}

resource "aws_iam_policy" "invoke_rules" {
  name        = "allow-rules-invoke-${var.environment}"
  description = "added perms for request-create lambda"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "LambdaInvoke"
        Action = [
          "lambda:InvokeFunction",
        ]
        Effect   = "Allow"
        Resource = aws_lambda_function.rules.arn
      },
    ]
  })
}

##########################

module "request_approve" {
  source        = "../go-lambda-service"
  service_name  = "request-approve"
  env           = var.environment
  env_vars      = merge(local.POSTGRES_VARS, {})
  create_secret = true
}

module "requests_by_account" {
  source       = "../go-lambda-service"
  service_name = "requests-by-account"
  env          = var.environment
  env_vars = merge(local.POSTGRES_VARS, {
    RETURN_RECORD_LIMIT = var.requests_by_account_return_limit
  })
  create_secret = true
}

module "request_by_id" {
  source        = "../go-lambda-service"
  service_name  = "request-by-id"
  env           = var.environment
  env_vars      = merge(local.POSTGRES_VARS, {})
  create_secret = true
}

module "transactions_by_account" {
  source       = "../go-lambda-service"
  service_name = "transactions-by-account"
  env          = var.environment
  env_vars = merge(local.POSTGRES_VARS, {
    RETURN_RECORD_LIMIT = var.transactions_by_account_return_limit
  })
  create_secret = true
}

module "transaction_by_id" {
  source        = "../go-lambda-service"
  service_name  = "transaction-by-id"
  env           = var.environment
  env_vars      = merge(local.POSTGRES_VARS, {})
  create_secret = true
}

module "auto_confirm" {
  source            = "../go-lambda-service"
  service_name      = "auto-confirm"
  env               = var.environment
  env_vars          = merge(local.POSTGRES_VARS, {})
  invoke_principals = ["cognito-idp.amazonaws.com"]
}

module "wss_connect" {
  source            = "../go-lambda-service"
  service_name      = "wss-connect"
  env               = var.environment
  env_vars          = merge(local.POSTGRES_VARS, {})
  invoke_principals = ["apigateway.amazonaws.com"]
}

// invoked by request-create or
// request-approve through sns
module "notifications_send" {
  source       = "../go-lambda-service"
  service_name = "notifications-send"
  env          = var.environment
  env_vars = merge(local.POSTGRES_VARS, {
    APIGW_CONNECTIONS_URI = local.APIGW_CONNECTIONS_URI
  })
  invoke_principals    = ["sns.amazonaws.com"]
  attached_policy_arns = [aws_iam_policy.wss.arn]
}

resource "aws_sns_topic_subscription" "notifications_send" {
  topic_arn = aws_sns_topic.notifications.arn
  protocol  = "lambda"
  endpoint  = module.notifications_send.lambda_arn
}

module "notifications_get" {
  source       = "../go-lambda-service"
  service_name = "notifications-get"
  env          = var.environment
  env_vars = merge(local.POSTGRES_VARS, {
    NOTIFICATIONS_RETURN_LIMIT = var.notifications_return_limit
    APIGW_CONNECTIONS_URI      = local.APIGW_CONNECTIONS_URI
    POOL_NAME                  = aws_cognito_user_pool.pool.name
  })
  invoke_principals    = ["apigateway.amazonaws.com"]
  attached_policy_arns = [aws_iam_policy.wss.arn]
}

module "notifications_clear" {
  source       = "../go-lambda-service"
  service_name = "notifications-clear"
  env          = var.environment
  env_vars = merge(local.POSTGRES_VARS, {
    APIGW_CONNECTIONS_URI = local.APIGW_CONNECTIONS_URI
    POOL_NAME             = aws_cognito_user_pool.pool.name
  })
  invoke_principals    = ["apigateway.amazonaws.com"]
  attached_policy_arns = [aws_iam_policy.wss.arn]
}

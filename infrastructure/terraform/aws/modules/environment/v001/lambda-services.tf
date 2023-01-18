// modules require ${service_name}-src.zip in artifacts s3

module "request_create" {
  source       = "../../go-lambda-service/v001"
  service_name = "request-create"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    NOTIFY_TOPIC_ARN     = aws_sns_topic.notifications.arn,
    ENABLE_NOTIFICATIONS = var.enable_notifications
    RULES_URL            = aws_lambda_function_url.rules.function_url
  })
  invoke_principals     = [aws_iam_role.graphql_role.arn]
  artifacts_bucket_name = var.artifacts_bucket_name
  attached_policy_arns  = [aws_iam_policy.invoke_rules.arn]
  create_secret         = true // suppports local testing
}

resource "aws_iam_policy" "invoke_rules" {
  name        = "allow-rules-invoke-${local.ID_ENV}"
  description = "added perms for request-create lambda in ${local.SPACED_ID_ENV}"
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
      {
        Sid = "SNSPublish"
        Action = [
          "sns:Publish",
        ]
        Effect   = "Allow"
        Resource = aws_sns_topic.notifications.arn
      },
    ]
  })
}

##########################

module "request_approve" {
  source       = "../../go-lambda-service/v001"
  service_name = "request-approve"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    NOTIFY_TOPIC_ARN     = aws_sns_topic.notifications.arn,
    ENABLE_NOTIFICATIONS = var.enable_notifications
  })
  invoke_principals     = [aws_iam_role.graphql_role.arn]
  artifacts_bucket_name = var.artifacts_bucket_name
  create_secret         = true
  attached_policy_arns  = [aws_iam_policy.invoke_rules.arn]
}

module "requests_by_account" {
  source       = "../../go-lambda-service/v001"
  service_name = "requests-by-account"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    RETURN_RECORD_LIMIT = var.requests_by_account_return_limit
  })
  invoke_principals     = [aws_iam_role.graphql_role.arn]
  artifacts_bucket_name = var.artifacts_bucket_name
  create_secret         = true
}

module "request_by_id" {
  source                = "../../go-lambda-service/v001"
  service_name          = "request-by-id"
  env                   = var.env
  ssm_prefix            = var.ssm_prefix
  env_id                = var.env_id
  env_vars              = merge(local.POSTGRES_VARS, {})
  invoke_principals     = [aws_iam_role.graphql_role.arn]
  artifacts_bucket_name = var.artifacts_bucket_name
  create_secret         = true
}

module "transactions_by_account" {
  source       = "../../go-lambda-service/v001"
  service_name = "transactions-by-account"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    RETURN_RECORD_LIMIT = var.transactions_by_account_return_limit
  })
  invoke_principals     = [aws_iam_role.graphql_role.arn]
  artifacts_bucket_name = var.artifacts_bucket_name
  create_secret         = true
}

module "transaction_by_id" {
  source                = "../../go-lambda-service/v001"
  service_name          = "transaction-by-id"
  env                   = var.env
  ssm_prefix            = var.ssm_prefix
  env_id                = var.env_id
  env_vars              = merge(local.POSTGRES_VARS, {})
  invoke_principals     = [aws_iam_role.graphql_role.arn]
  artifacts_bucket_name = var.artifacts_bucket_name
  create_secret         = true
}

module "balance_by_account" {
  source                = "../../go-lambda-service/v001"
  service_name          = "balance-by-account"
  env                   = var.env
  ssm_prefix            = var.ssm_prefix
  env_id                = var.env_id
  env_vars              = merge(local.POSTGRES_VARS, {})
  invoke_principals     = [aws_iam_role.graphql_role.arn]
  artifacts_bucket_name = var.artifacts_bucket_name
  create_secret         = true
}

module "auto_confirm" {
  source       = "../../go-lambda-service/v001"
  service_name = "auto-confirm"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    INITIAL_ACCOUNT_BALANCE = var.initial_account_balance
  })
  artifacts_bucket_name = var.artifacts_bucket_name
  invoke_principals     = ["cognito-idp.amazonaws.com"]
}

module "wss_connect" {
  source                = "../../go-lambda-service/v001"
  service_name          = "wss-connect"
  env                   = var.env
  ssm_prefix            = var.ssm_prefix
  env_id                = var.env_id
  env_vars              = merge(local.POSTGRES_VARS, {})
  artifacts_bucket_name = var.artifacts_bucket_name
  invoke_principals     = ["apigateway.amazonaws.com"]
}

// invoked by request-create or request-approve through sns
module "notifications_send" {
  source       = "../../go-lambda-service/v001"
  service_name = "notifications-send"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    APIGW_CONNECTIONS_URI = local.APIGW_CONNECTIONS_URI
  })
  invoke_principals     = ["sns.amazonaws.com"]
  artifacts_bucket_name = var.artifacts_bucket_name
  attached_policy_arns  = [aws_iam_policy.wss.arn]
}

resource "aws_sns_topic_subscription" "notifications_send" {
  topic_arn = aws_sns_topic.notifications.arn
  protocol  = "lambda"
  endpoint  = module.notifications_send.lambda_arn
}

// invoked by getnotifications through wss
module "notifications_get" {
  source       = "../../go-lambda-service/v001"
  service_name = "notifications-get"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    NOTIFICATIONS_RETURN_LIMIT = var.notifications_return_limit
    APIGW_CONNECTIONS_URI      = local.APIGW_CONNECTIONS_URI
    COGNITO_JWKS_URI           = local.COGNITO_JWKS_URI,
    ENABLE_API_AUTH            = var.enable_api_auth
  })
  artifacts_bucket_name = var.artifacts_bucket_name
  invoke_principals     = ["apigateway.amazonaws.com"]
  attached_policy_arns  = [aws_iam_policy.wss.arn]
}

// invoked by clearnotifications through wss
module "notifications_clear" {
  source       = "../../go-lambda-service/v001"
  service_name = "notifications-clear"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    APIGW_CONNECTIONS_URI = local.APIGW_CONNECTIONS_URI
    COGNITO_JWKS_URI      = local.COGNITO_JWKS_URI,
    ENABLE_API_AUTH       = var.enable_api_auth
  })
  artifacts_bucket_name = var.artifacts_bucket_name
  invoke_principals     = ["apigateway.amazonaws.com"]
  attached_policy_arns  = [aws_iam_policy.wss.arn]
}

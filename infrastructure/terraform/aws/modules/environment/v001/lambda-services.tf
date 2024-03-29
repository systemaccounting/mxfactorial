// modules require ${service_name}-src.zip in artifacts s3

module "request_create" {
  source       = "../../provided-lambda/v001"
  service_name = "request-create"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    RULE_URL = module.rule.lambda_function_url
  })
  aws_lwa_port          = local.REQUEST_CREATE_PORT
  invoke_url_principals = [aws_iam_role.graphql_role.arn]
  artifacts_bucket_name = var.artifacts_bucket_name
  attached_policy_arns  = []
  create_secret         = true // suppports local testing
}

##########################

module "request_approve" {
  source                = "../../provided-lambda/v001"
  service_name          = "request-approve"
  env                   = var.env
  ssm_prefix            = var.ssm_prefix
  env_id                = var.env_id
  env_vars              = merge(local.POSTGRES_VARS, {})
  aws_lwa_port          = local.REQUEST_APPROVE_PORT
  invoke_url_principals = [aws_iam_role.graphql_role.arn]
  artifacts_bucket_name = var.artifacts_bucket_name
  create_secret         = true
  attached_policy_arns  = []
}

module "requests_by_account" {
  source       = "../../provided-lambda/v001"
  service_name = "requests-by-account"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    RETURN_RECORD_LIMIT = local.RETURN_RECORD_LIMIT
  })
  aws_lwa_port          = local.REQUESTS_BY_ACCOUNT_PORT
  invoke_url_principals = [aws_iam_role.graphql_role.arn]
  artifacts_bucket_name = var.artifacts_bucket_name
  create_secret         = true
}

module "request_by_id" {
  source                = "../../provided-lambda/v001"
  service_name          = "request-by-id"
  env                   = var.env
  ssm_prefix            = var.ssm_prefix
  env_id                = var.env_id
  env_vars              = merge(local.POSTGRES_VARS, {})
  aws_lwa_port          = local.REQUEST_BY_ID_PORT
  invoke_url_principals = [aws_iam_role.graphql_role.arn]
  artifacts_bucket_name = var.artifacts_bucket_name
  create_secret         = true
}

module "transactions_by_account" {
  source       = "../../provided-lambda/v001"
  service_name = "transactions-by-account"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  aws_lwa_port = local.TRANSACTIONS_BY_ACCOUNT_PORT
  env_vars = merge(local.POSTGRES_VARS, {
    RETURN_RECORD_LIMIT = local.RETURN_RECORD_LIMIT
  })
  invoke_url_principals = [aws_iam_role.graphql_role.arn]
  artifacts_bucket_name = var.artifacts_bucket_name
  create_secret         = true
}

module "transaction_by_id" {
  source                = "../../provided-lambda/v001"
  service_name          = "transaction-by-id"
  env                   = var.env
  ssm_prefix            = var.ssm_prefix
  env_id                = var.env_id
  env_vars              = merge(local.POSTGRES_VARS, {})
  aws_lwa_port          = local.TRANSACTION_BY_ID_PORT
  invoke_url_principals = [aws_iam_role.graphql_role.arn]
  artifacts_bucket_name = var.artifacts_bucket_name
  create_secret         = true
}

module "balance_by_account" {
  source                = "../../provided-lambda/v001"
  service_name          = "balance-by-account"
  env                   = var.env
  ssm_prefix            = var.ssm_prefix
  env_id                = var.env_id
  env_vars              = merge(local.POSTGRES_VARS, {})
  aws_lwa_port          = local.BALANCE_BY_ACCOUNT_PORT
  invoke_url_principals = [aws_iam_role.graphql_role.arn]
  artifacts_bucket_name = var.artifacts_bucket_name
  create_secret         = true
}

module "auto_confirm" {
  source       = "../../provided-lambda/v001"
  service_name = "auto-confirm"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    INITIAL_ACCOUNT_BALANCE = var.initial_account_balance
  })
  artifacts_bucket_name = var.artifacts_bucket_name
  invoke_arn_principals = ["cognito-idp.amazonaws.com"]
}

module "wss_connect" {
  source                = "../../go-lambda/v001"
  service_name          = "wss-connect"
  env                   = var.env
  ssm_prefix            = var.ssm_prefix
  env_id                = var.env_id
  env_vars              = merge(local.POSTGRES_VARS, {})
  artifacts_bucket_name = var.artifacts_bucket_name
  invoke_arn_principals = ["apigateway.amazonaws.com"]
}

// invoked by request-create or request-approve through sns
module "notifications_send" {
  source       = "../../go-lambda/v001"
  service_name = "notifications-send"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    APIGW_CONNECTIONS_URI = local.APIGW_CONNECTIONS_URI
  })
  invoke_arn_principals = ["sns.amazonaws.com"]
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
  source       = "../../go-lambda/v001"
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
  invoke_arn_principals = ["apigateway.amazonaws.com"]
  attached_policy_arns  = [aws_iam_policy.wss.arn]
}

// invoked by clearnotifications through wss
module "notifications_clear" {
  source       = "../../go-lambda/v001"
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
  invoke_arn_principals = ["apigateway.amazonaws.com"]
  attached_policy_arns  = [aws_iam_policy.wss.arn]
}

module "rule" {
  source       = "../../provided-lambda/v001"
  service_name = "rule"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    RUST_LOG = "info"
  })
  aws_lwa_port = local.RULE_PORT
  invoke_url_principals = [
    aws_iam_role.graphql_role.arn,
    module.request_create.lambda_role_arn,
  ]
  artifacts_bucket_name = var.artifacts_bucket_name
  attached_policy_arns  = []
  create_secret         = true // suppports local testing
}

// modules require ${service_name}-${ID_ENV} ecr image repositories in init-$ENV module

module "graphql" {
  source       = "../../provided-lambda/v001"
  service_name = "graphql"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    ENABLE_API_AUTH             = var.enable_api_auth
    RULE_URL                    = module.rule.lambda_function_url
    REQUEST_CREATE_URL          = module.request_create.lambda_function_url
    REQUEST_APPROVE_URL         = module.request_approve.lambda_function_url
    REQUEST_BY_ID_URL           = module.request_by_id.lambda_function_url
    REQUESTS_BY_ACCOUNT_URL     = module.requests_by_account.lambda_function_url
    TRANSACTIONS_BY_ACCOUNT_URL = module.transactions_by_account.lambda_function_url
    TRANSACTION_BY_ID_URL       = module.transaction_by_id.lambda_function_url
    BALANCE_BY_ACCOUNT_URL      = module.balance_by_account.lambda_function_url
  })
  aws_lwa_port          = local.GRAPHQL_PORT
  invoke_url_principals = []
  attached_policy_arns  = []
  create_secret         = true // suppports local testing
}

module "rule" {
  source       = "../../provided-lambda/v001"
  service_name = "rule"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars     = merge(local.POSTGRES_VARS, {})
  aws_lwa_port = local.RULE_PORT
  invoke_url_principals = [
    module.graphql.lambda_role_arn,
    module.request_create.lambda_role_arn,
  ]
  attached_policy_arns = []
  create_secret        = true
}

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
  invoke_url_principals = [module.graphql.lambda_role_arn]
  attached_policy_arns  = []
  create_secret         = true
}

module "request_approve" {
  source                = "../../provided-lambda/v001"
  service_name          = "request-approve"
  env                   = var.env
  ssm_prefix            = var.ssm_prefix
  env_id                = var.env_id
  env_vars              = merge(local.POSTGRES_VARS, {})
  aws_lwa_port          = local.REQUEST_APPROVE_PORT
  invoke_url_principals = [module.graphql.lambda_role_arn]
  create_secret         = true
  attached_policy_arns  = []
}

module "balance_by_account" {
  source                = "../../provided-lambda/v001"
  service_name          = "balance-by-account"
  env                   = var.env
  ssm_prefix            = var.ssm_prefix
  env_id                = var.env_id
  env_vars              = merge(local.POSTGRES_VARS, {})
  aws_lwa_port          = local.BALANCE_BY_ACCOUNT_PORT
  invoke_url_principals = [module.graphql.lambda_role_arn]
  create_secret         = true
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
  invoke_url_principals = [module.graphql.lambda_role_arn]
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
  invoke_url_principals = [module.graphql.lambda_role_arn]
  create_secret         = true
}

module "transactions_by_account" {
  source       = "../../provided-lambda/v001"
  service_name = "transactions-by-account"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    RETURN_RECORD_LIMIT = local.RETURN_RECORD_LIMIT
  })
  aws_lwa_port          = local.TRANSACTIONS_BY_ACCOUNT_PORT
  invoke_url_principals = [module.graphql.lambda_role_arn]
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
  invoke_url_principals = [module.graphql.lambda_role_arn]
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
  invoke_arn_principals = ["cognito-idp.amazonaws.com"]
}

module "client" {
  source       = "../../provided-lambda/v001"
  service_name = "client"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = {
    PORT = local.CLIENT_PORT
    # variables requiring a PUBLIC_* prefix
    # https://svelte.dev/docs/kit/configuration#env
    PUBLIC_POOL_ID                   = aws_cognito_user_pool.pool.id
    PUBLIC_CLIENT_ID                 = aws_cognito_user_pool_client.client.id
    PUBLIC_GRAPHQL_URI               = module.graphql_apigwv2.invoke_url
    PUBLIC_GOOGLE_MAPS_API_KEY       = null
    PUBLIC_GRAPHQL_SUBSCRIPTIONS_URI = null
  }
  aws_lwa_port          = local.CLIENT_PORT
  invoke_url_principals = [module.graphql.lambda_role_arn]
  create_secret         = true
}

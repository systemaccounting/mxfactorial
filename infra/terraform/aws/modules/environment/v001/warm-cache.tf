locals {
  WARM_CACHE_CONF = local.PROJECT_CONF.services.rule.env_var.set
}

module "warm_cache" {
  source         = "../../provided-lambda/v001"
  service_name   = "warm-cache"
  env            = var.env
  ssm_prefix     = var.ssm_prefix
  env_id         = var.env_id
  lambda_timeout = 300
  env_vars = merge(local.POSTGRES_VARS, {
    WARM_CACHE_PASSPHRASE  = random_password.warm_cache.result
    TRANSACTION_DDB_TABLE  = aws_dynamodb_table.cache.name
    CACHE_KEY_RULES_STATE  = local.WARM_CACHE_CONF.CACHE_KEY_RULES_STATE.default
    CACHE_KEY_RULES_ACCOUNT = local.WARM_CACHE_CONF.CACHE_KEY_RULES_ACCOUNT.default
    CACHE_KEY_PROFILE      = local.WARM_CACHE_CONF.CACHE_KEY_PROFILE.default
    CACHE_KEY_PROFILE_ID   = local.WARM_CACHE_CONF.CACHE_KEY_PROFILE_ID.default
    CACHE_KEY_APPROVERS    = local.WARM_CACHE_CONF.CACHE_KEY_APPROVERS.default
  })
  create_secret                 = true
  attached_policy_arns          = [aws_iam_policy.warm_cache_dynamodb.arn]
  lambda_url_authorization_type = "NONE"
}

resource "random_password" "warm_cache" {
  length  = 8
  special = false
}

resource "aws_lambda_permission" "invoke_warm_cache_lambda" {
  statement_id           = "AllowWarmCacheInvoke${local.TITLED_ID_ENV}"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = module.warm_cache.lambda_function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

resource "aws_iam_policy" "warm_cache_dynamodb" {
  name = "warm-cache-dynamodb-${local.ID_ENV}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dynamodb:PutItem", "dynamodb:BatchWriteItem"]
      Resource = aws_dynamodb_table.cache.arn
    }]
  })
}

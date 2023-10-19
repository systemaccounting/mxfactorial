module "go_migrate" {
  source       = "../../web-adapter-lambda/v001"
  service_name = "go-migrate"
  env          = var.env
  ssm_prefix   = var.ssm_prefix
  env_id       = var.env_id
  env_vars = merge(local.POSTGRES_VARS, {
    GO_MIGRATE_PASSPHRASE = random_password.go_migrate.result
  })
  aws_lwa_port                  = local.GO_MIGRATE_PORT
  artifacts_bucket_name         = var.artifacts_bucket_name
  create_secret                 = true
  attached_policy_arns          = [aws_iam_policy.invoke_rules.arn]
  lambda_url_authorization_type = "NONE"
}

resource "random_password" "go_migrate" {
  length  = 8
  special = false
}

resource "aws_lambda_permission" "invoke_go_migrate_lambda" {
  statement_id           = "AllowGoMigrateInvoke${local.TITLED_ID_ENV}"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = module.go_migrate.lambda_function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

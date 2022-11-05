resource "aws_ssm_parameter" "graphql_uri" {
  name        = "/${var.env}/${var.ssm_version}/api/graphql/uri"
  description = "graphql endpoint in ${var.env}"
  type        = "SecureString"
  // store apigw2 dns if no custom dns
  value = var.custom_domain_name == "" ? module.graphql_apigwv2.invoke_url : ("https://${var.env == "prod" ? "api.${var.custom_domain_name}" : "${var.env}-api.${var.custom_domain_name}"}")
  tags = {
    env = var.env
  }
}

resource "aws_ssm_parameter" "client_uri" {
  name        = "/${var.env}/${var.ssm_version}/client/uri"
  description = "client address in ${var.env}"
  type        = "SecureString"
  // store cloudfront dns if no custom dns
  value = var.custom_domain_name == "" ? "https://${aws_cloudfront_distribution.s3_client_distribution.domain_name}" : ("https://${var.env == "prod" ? var.custom_domain_name : "${var.env}.${var.custom_domain_name}"}")
  tags = {
    env = var.env
  }
}

resource "aws_ssm_parameter" "pool_id" {
  name        = "/${var.env}/${var.ssm_version}/auth/cognito/pool_id"
  description = "cognito pool id in ${var.env}"
  type        = "SecureString"
  value       = aws_cognito_user_pool.pool.id
  tags = {
    env = var.env
  }
}

resource "aws_ssm_parameter" "pool_name" {
  name        = "/${var.env}/${var.ssm_version}/auth/cognito/pool_name"
  description = "cognito pool name in ${var.env}"
  type        = "SecureString"
  value       = aws_cognito_user_pool.pool.name
  tags = {
    env = var.env
  }
}

resource "aws_ssm_parameter" "client_id" {
  name        = "/${var.env}/${var.ssm_version}/auth/cognito/client_id"
  description = "cognito client id in ${var.env}"
  type        = "SecureString"
  value       = aws_cognito_user_pool_client.client.id
  tags = {
    env = var.env
  }
}

resource "random_password" "test_account" {
  length  = 6
  special = false
}

resource "aws_ssm_parameter" "test_account" {
  name        = "/${var.env}/${var.ssm_version}/auth/cognito/test_account/secret"
  description = "test account secret in ${var.env}"
  type        = "SecureString"
  value       = random_password.test_account.result
  tags = {
    env = var.env
  }
}

resource "aws_ssm_parameter" "notifications_topic_arn" {
  name        = "/${var.env}/${var.ssm_version}/notifications/sns/topic/arn"
  description = "notifications topic arn in ${var.env}"
  type        = "SecureString"
  value       = aws_sns_topic.notifications.arn
  tags = {
    env = var.env
  }
}

resource "aws_ssm_parameter" "postgres_db_name" {
  name        = "/${var.env}/${var.ssm_version}/database/sql/postgres/pgdatabase"
  description = "postgres db name in ${var.env}"
  type        = "SecureString"
  value       = local.POSTGRES_VARS.PGDATABASE
  tags = {
    env = var.env
  }
}

resource "aws_ssm_parameter" "postgres_host" {
  name        = "/${var.env}/${var.ssm_version}/database/sql/postgres/pghost"
  description = "postgres host in ${var.env}"
  type        = "SecureString"
  value       = local.POSTGRES_VARS.PGHOST
  tags = {
    env = var.env
  }
}

resource "aws_ssm_parameter" "postgres_password" {
  name        = "/${var.env}/${var.ssm_version}/database/sql/postgres/pgpassword"
  description = "postgres password in ${var.env}"
  type        = "SecureString"
  value       = local.POSTGRES_VARS.PGPASSWORD
  tags = {
    env = var.env
  }
}

resource "aws_ssm_parameter" "postgres_port" {
  name        = "/${var.env}/${var.ssm_version}/database/sql/postgres/pgport"
  description = "postgres port in ${var.env}"
  type        = "SecureString"
  value       = local.POSTGRES_VARS.PGPORT
  tags = {
    env = var.env
  }
}

resource "aws_ssm_parameter" "postgres_user" {
  name        = "/${var.env}/${var.ssm_version}/database/sql/postgres/pguser"
  description = "postgres user in ${var.env}"
  type        = "SecureString"
  value       = local.POSTGRES_VARS.PGUSER
  tags = {
    env = var.env
  }
}

resource "aws_ssm_parameter" "rule_lambda_arn" {
  name        = "/${var.env}/${var.ssm_version}/service/lambda/rules/arn"
  description = "rule lambda arn in ${var.env}"
  type        = "SecureString"
  value       = aws_lambda_function.rules.arn
  tags = {
    env = var.env
  }
}

resource "aws_ssm_parameter" "db_reset_passphrase" {
  name        = "/${var.env}/${var.ssm_version}/tool/lambda/db_reset/passphrase"
  description = "db reset passphrase in ${var.env}"
  type        = "SecureString"
  value       = random_password.db_reset.result
  tags = {
    env = var.env
  }
}

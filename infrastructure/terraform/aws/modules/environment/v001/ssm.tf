resource "aws_ssm_parameter" "graphql_uri" {
  name        = "/${var.ssm_prefix}/api/graphql/uri"
  description = "graphql endpoint in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  // store apigw2 dns if no custom dns
  value = var.custom_domain_name == "" ? module.graphql_apigwv2.invoke_url : ("https://${var.env == "prod" ? "api.${var.custom_domain_name}" : "${var.env}-api.${var.custom_domain_name}"}")
}

resource "aws_ssm_parameter" "cache_client_uri" {
  count       = var.build_cache ? 1 : 0 // false during terraform development
  name        = "/${var.ssm_prefix}/client/uri"
  description = "client address in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  overwrite   = true
  // store cloudfront dns if no custom dns
  value = var.custom_domain_name == "" ? "https://${aws_cloudfront_distribution.s3_client_distribution[0].domain_name}" : ("https://${var.env == "prod" ? var.custom_domain_name : "${var.env}.${var.custom_domain_name}"}")
}

resource "aws_ssm_parameter" "s3_client_uri" {
  count       = var.build_cache ? 0 : 1 // replaces cloudfront cache address when cloudfront avoided during development
  name        = "/${var.ssm_prefix}/client/uri"
  description = "client address in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  overwrite   = true
  value       = "http://${var.client_origin_bucket_name}.s3-website-${data.aws_region.current.name}.amazonaws.com"
}

resource "aws_ssm_parameter" "pool_id" {
  name        = "/${var.ssm_prefix}/auth/cognito/pool_id"
  description = "cognito pool id in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = aws_cognito_user_pool.pool.id
}

resource "aws_ssm_parameter" "pool_name" {
  name        = "/${var.ssm_prefix}/auth/cognito/pool_name"
  description = "cognito pool name in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = aws_cognito_user_pool.pool.name
}

resource "aws_ssm_parameter" "client_id" {
  name        = "/${var.ssm_prefix}/auth/cognito/client_id"
  description = "cognito client id in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = aws_cognito_user_pool_client.client.id
}

resource "random_password" "test_account" {
  length  = 6
  special = false
}

resource "aws_ssm_parameter" "test_account" {
  name        = "/${var.ssm_prefix}/auth/cognito/test_account/secret"
  description = "test account secret in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = random_password.test_account.result
}

resource "aws_ssm_parameter" "notifications_topic_arn" {
  name        = "/${var.ssm_prefix}/notifications/sns/topic/arn"
  description = "notifications topic arn in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = aws_sns_topic.notifications.arn
}

resource "aws_ssm_parameter" "postgres_db_name" {
  count       = var.build_db ? 1 : 0 // false during terraform development
  name        = "/${var.ssm_prefix}/database/sql/postgres/pgdatabase"
  description = "postgres db name in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = local.POSTGRES_VARS.PGDATABASE
}

resource "aws_ssm_parameter" "postgres_host" {
  count       = var.build_db ? 1 : 0 // false during terraform development
  name        = "/${var.ssm_prefix}/database/sql/postgres/pghost"
  description = "postgres host in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = local.POSTGRES_VARS.PGHOST
}

resource "aws_ssm_parameter" "postgres_password" {
  count       = var.build_db ? 1 : 0 // false during terraform development
  name        = "/${var.ssm_prefix}/database/sql/postgres/pgpassword"
  description = "postgres password in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = local.POSTGRES_VARS.PGPASSWORD
}

resource "aws_ssm_parameter" "postgres_port" {
  count       = var.build_db ? 1 : 0 // false during terraform development
  name        = "/${var.ssm_prefix}/database/sql/postgres/pgport"
  description = "postgres port in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = local.POSTGRES_VARS.PGPORT
}

resource "aws_ssm_parameter" "postgres_user" {
  count       = var.build_db ? 1 : 0 // false during terraform development
  name        = "/${var.ssm_prefix}/database/sql/postgres/pguser"
  description = "postgres user in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = local.POSTGRES_VARS.PGUSER
}

resource "aws_ssm_parameter" "db_reset_passphrase" {
  name        = "/${var.ssm_prefix}/tool/lambda/db_reset/passphrase"
  description = "db reset passphrase in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = random_password.db_reset.result
}

resource "aws_ssm_parameter" "lambda_readiness_check_path" {
  name = "/${var.ssm_prefix}/service/lambda/readiness_check_path"
  // https://github.com/awslabs/aws-lambda-web-adapter#readiness-check
  description = "lambda web adapter readiness check path in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = var.readiness_check_path
}
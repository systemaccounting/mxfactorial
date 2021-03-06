// outputs stored in secrets manager for automated
// retrieval of application environment variables

resource "aws_secretsmanager_secret" "graphql_api" {
  name                    = "${var.environment}/GRAPHQL_API"
  recovery_window_in_days = 0
  description             = "graphql endpoint in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "graphql_api" {
  secret_id     = aws_secretsmanager_secret.graphql_api.id
  secret_string = "https://${aws_route53_record.api_fqdn.name}"
}

resource "aws_secretsmanager_secret" "pool_id" {
  name                    = "${var.environment}/POOL_ID"
  recovery_window_in_days = 0
  description             = "cognito pool id in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "pool_id" {
  secret_id     = aws_secretsmanager_secret.pool_id.id
  secret_string = aws_cognito_user_pool.pool.id
}

resource "aws_secretsmanager_secret" "pool_name" {
  name                    = "${var.environment}/POOL_NAME"
  recovery_window_in_days = 0
  description             = "cognito pool id in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "pool_name" {
  secret_id     = aws_secretsmanager_secret.pool_name.id
  secret_string = aws_cognito_user_pool.pool.name
}

resource "aws_secretsmanager_secret" "client_id" {
  name                    = "${var.environment}/CLIENT_ID"
  recovery_window_in_days = 0
  description             = "cognito client id in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "client_id" {
  secret_id     = aws_secretsmanager_secret.client_id.id
  secret_string = aws_cognito_user_pool_client.client.id
}

resource "aws_secretsmanager_secret" "test_account" {
  name                    = "${var.environment}/SECRET"
  recovery_window_in_days = 0
  description             = "test account secret in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "test_account" {
  secret_id     = aws_secretsmanager_secret.test_account.id
  secret_string = random_password.test_account.result
}

resource "random_password" "test_account" {
  length  = 6
  special = false
}

resource "aws_secretsmanager_secret" "notifications_topic_arn" {
  name                    = "${var.environment}/NOTIFY_TOPIC_ARN"
  recovery_window_in_days = 0
  description             = "notifications topic arn in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "notifications_topic_arn" {
  secret_id     = aws_secretsmanager_secret.notifications_topic_arn.id
  secret_string = aws_sns_topic.notifications.arn
}

resource "aws_secretsmanager_secret" "postgres_db_name" {
  name                    = "${var.environment}/PGDATABASE"
  recovery_window_in_days = 0
  description             = "postgres db name in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "postgres_db_name" {
  secret_id     = aws_secretsmanager_secret.postgres_db_name.id
  secret_string = local.POSTGRES_VARS.PGDATABASE
}

resource "aws_secretsmanager_secret" "postgres_host" {
  name                    = "${var.environment}/PGHOST"
  recovery_window_in_days = 0
  description             = "postgres host in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "postgres_host" {
  secret_id     = aws_secretsmanager_secret.postgres_host.id
  secret_string = local.POSTGRES_VARS.PGHOST
}

resource "aws_secretsmanager_secret" "postgres_password" {
  name                    = "${var.environment}/PGPASSWORD"
  recovery_window_in_days = 0
  description             = "postgres password in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "postgres_password" {
  secret_id     = aws_secretsmanager_secret.postgres_password.id
  secret_string = local.POSTGRES_VARS.PGPASSWORD
}

resource "aws_secretsmanager_secret" "postgres_port" {
  name                    = "${var.environment}/PGPORT"
  recovery_window_in_days = 0
  description             = "postgres port in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "postgres_port" {
  secret_id     = aws_secretsmanager_secret.postgres_port.id
  secret_string = local.POSTGRES_VARS.PGPORT
}

resource "aws_secretsmanager_secret" "postgres_user" {
  name                    = "${var.environment}/PGUSER"
  recovery_window_in_days = 0
  description             = "postgres user in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "postgres_user" {
  secret_id     = aws_secretsmanager_secret.postgres_user.id
  secret_string = local.POSTGRES_VARS.PGUSER
}

resource "aws_secretsmanager_secret" "rule_instance_table_name" {
  name                    = "${var.environment}/RULE_INSTANCE_TABLE_NAME"
  recovery_window_in_days = 0
  description             = "rule instance table name in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "rule_instance_table_name" {
  secret_id     = aws_secretsmanager_secret.rule_instance_table_name.id
  secret_string = aws_dynamodb_table.rule_instances.name
}

resource "aws_secretsmanager_secret" "rds_transaction_teardown_lambda" {
  name                    = "${var.environment}/RDS_TRANSACTION_TEARDOWN_LAMBDA"
  recovery_window_in_days = 0
  description             = "rds transaction teardown lambda name in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "rds_transaction_teardown_lambda" {
  secret_id     = aws_secretsmanager_secret.rds_transaction_teardown_lambda.id
  secret_string = aws_lambda_function.integration_test_data_teardown_lambda.function_name
}

resource "aws_secretsmanager_secret" "cognito_jsonwebkey_url" {
  name                    = "${var.environment}/JWKS_URL"
  recovery_window_in_days = 0
  description             = "cognito jsonwebkey url in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "cognito_jsonwebkey_url" {
  secret_id     = aws_secretsmanager_secret.cognito_jsonwebkey_url.id
  secret_string = aws_lambda_function.graphql.environment[0].variables.JWKS_URL
}

resource "aws_secretsmanager_secret" "request_create_lambda_arn" {
  name                    = "${var.environment}/REQUEST_CREATE_LAMBDA_ARN"
  recovery_window_in_days = 0
  description             = "cognito jsonwebkey url in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "request_create_lambda_arn" {
  secret_id     = aws_secretsmanager_secret.request_create_lambda_arn.id
  secret_string = aws_lambda_function.request_create.arn
}

resource "aws_secretsmanager_secret" "request_approve_lambda_arn" {
  name                    = "${var.environment}/REQUEST_APPROVE_LAMBDA_ARN"
  recovery_window_in_days = 0
  description             = "cognito jsonwebkey url in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "request_approve_lambda_arn" {
  secret_id     = aws_secretsmanager_secret.request_approve_lambda_arn.id
  secret_string = aws_lambda_function.request_approve.arn
}

resource "aws_secretsmanager_secret" "nine_percent_ca_sales_tax" {
  name                    = "${var.environment}/NINE_PERCENT_CA_SALES_TAX"
  recovery_window_in_days = 0
  description             = "nine percent ca sales tax in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "nine_percent_ca_sales_tax" {
  secret_id     = aws_secretsmanager_secret.nine_percent_ca_sales_tax.id
  secret_string = base64encode(local.nine_percent_ca_sales_tax_rule)
}

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

resource "aws_secretsmanager_secret" "rules_url" {
  name                    = "${var.environment}/RULES_URL"
  recovery_window_in_days = 0
  description             = "rules url in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "rules_url" {
  secret_id     = aws_secretsmanager_secret.rules_url.id
  secret_string = local.RULES_URL
}

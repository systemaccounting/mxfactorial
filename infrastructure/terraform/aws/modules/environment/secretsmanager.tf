// outputs stored in secrets manager for automated
// retrieval of application environment variables

resource "aws_secretsmanager_secret" "graphql_api" {
  name        = "${var.environment}/GRAPHQL_API"
  description = "graphql endpoint in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "graphql_api" {
  secret_id     = aws_secretsmanager_secret.graphql_api.id
  secret_string = "https://${aws_route53_record.api_fqdn.name}"
}

resource "aws_secretsmanager_secret" "pool_id" {
  name        = "${var.environment}/POOL_ID"
  description = "cognito pool id in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "pool_id" {
  secret_id     = aws_secretsmanager_secret.pool_id.id
  secret_string = aws_cognito_user_pool.pool.id
}

resource "aws_secretsmanager_secret" "pool_name" {
  name        = "${var.environment}/POOL_NAME"
  description = "cognito pool id in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "pool_name" {
  secret_id     = aws_secretsmanager_secret.pool_name.id
  secret_string = aws_cognito_user_pool.pool.name
}

resource "aws_secretsmanager_secret" "client_id" {
  name        = "${var.environment}/CLIENT_ID"
  description = "cognito client id in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "client_id" {
  secret_id     = aws_secretsmanager_secret.client_id.id
  secret_string = aws_cognito_user_pool_client.client.id
}

resource "aws_secretsmanager_secret" "test_account" {
  name        = "${var.environment}/SECRET"
  description = "test account secret in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "test_account" {
  secret_id     = aws_secretsmanager_secret.test_account.id
  secret_string = random_password.test_account.result
}

resource "random_password" "test_account" {
  length  = 6
  special = false
}

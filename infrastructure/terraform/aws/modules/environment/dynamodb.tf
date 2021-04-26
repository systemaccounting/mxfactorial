resource "aws_dynamodb_table" "notifications" {
  name         = "notifications-new-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "uuid"
  range_key    = "timestamp"

  attribute {
    name = "uuid"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  attribute {
    name = "account"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  global_secondary_index {
    name            = "account-index"
    hash_key        = "account"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  tags = {
    env = var.environment
  }
}

// todo: change to NOTIFICATIONS_TABLE_NAME after replacing cf table
resource "aws_secretsmanager_secret" "notifications_table_name" {
  name                    = "${var.environment}/NOTIFICATIONS_TABLE_NAME_NEW"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "notifications_table_name" {
  secret_id     = aws_secretsmanager_secret.notifications_table_name.id
  secret_string = aws_dynamodb_table.notifications.id
}

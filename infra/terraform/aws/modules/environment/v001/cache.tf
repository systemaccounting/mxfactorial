locals {
  ENVIRONMENT_CONF      = local.PROJECT_CONF.infra.terraform.aws.modules.environment.env_var.set
  CACHE_TABLE_NAME      = local.ENVIRONMENT_CONF.TRANSACTION_DDB_TABLE.default
  CACHE_TABLE_HASH_KEY  = local.ENVIRONMENT_CONF.CACHE_TABLE_HASH_KEY.default
  CACHE_TABLE_RANGE_KEY = local.ENVIRONMENT_CONF.CACHE_TABLE_RANGE_KEY.default
}

resource "aws_dynamodb_table" "cache" {
  name         = "${local.CACHE_TABLE_NAME}-${local.ID_ENV}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = local.CACHE_TABLE_HASH_KEY
  range_key    = local.CACHE_TABLE_RANGE_KEY

  attribute {
    name = local.CACHE_TABLE_HASH_KEY
    type = "S"
  }

  attribute {
    name = local.CACHE_TABLE_RANGE_KEY
    type = "S"
  }
}

resource "aws_ssm_parameter" "transaction_ddb_table" {
  name        = "/${var.ssm_prefix}/${local.ENVIRONMENT_CONF.TRANSACTION_DDB_TABLE.ssm}"
  description = "dynamodb cache table name in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = aws_dynamodb_table.cache.name
}

resource "aws_iam_policy" "rule_dynamodb_read" {
  name = "rule-dynamodb-read-${local.ID_ENV}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dynamodb:GetItem", "dynamodb:Query", "dynamodb:PutItem"]
      Resource = aws_dynamodb_table.cache.arn
    }]
  })
}

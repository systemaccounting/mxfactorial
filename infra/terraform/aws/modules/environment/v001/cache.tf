locals {
  ENVIRONMENT_CONF      = local.PROJECT_CONF.infra.terraform.aws.modules.environment.env_var.set
  CACHE_TABLE_NAME      = local.ENVIRONMENT_CONF.TRANSACTION_DDB_TABLE.default
  CACHE_TABLE_HASH_KEY  = local.ENVIRONMENT_CONF.CACHE_TABLE_HASH_KEY.default
  CACHE_TABLE_RANGE_KEY = local.ENVIRONMENT_CONF.CACHE_TABLE_RANGE_KEY.default
}

resource "aws_dynamodb_table" "cache" {
  name             = "${local.CACHE_TABLE_NAME}-${local.ID_ENV}"
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = local.CACHE_TABLE_HASH_KEY
  range_key        = local.CACHE_TABLE_RANGE_KEY
  stream_enabled   = true
  stream_view_type = "NEW_IMAGE"

  attribute {
    name = local.CACHE_TABLE_HASH_KEY
    type = "S"
  }

  attribute {
    name = local.CACHE_TABLE_RANGE_KEY
    type = "S"
  }
}

resource "aws_iam_role" "pipes_gdp" {
  name = "pipes-gdp-${local.ID_ENV}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "pipes.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "pipes_gdp_source" {
  name = "pipes-gdp-source-${local.ID_ENV}"
  role = aws_iam_role.pipes_gdp.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:DescribeStream",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:ListStreams"
      ]
      Resource = aws_dynamodb_table.cache.stream_arn
    }]
  })
}

resource "aws_iam_role_policy" "pipes_gdp_target" {
  name = "pipes-gdp-target-${local.ID_ENV}"
  role = aws_iam_role.pipes_gdp.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "sns:Publish"
      Resource = aws_sns_topic.gdp.arn
    }]
  })
}

resource "aws_pipes_pipe" "gdp_broadcast" {
  name     = "gdp-broadcast-${local.ID_ENV}"
  role_arn = aws_iam_role.pipes_gdp.arn
  source   = aws_dynamodb_table.cache.stream_arn
  target   = aws_sns_topic.gdp.arn

  source_parameters {
    dynamodb_stream_parameters {
      starting_position = "LATEST"
      batch_size        = 1
    }
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

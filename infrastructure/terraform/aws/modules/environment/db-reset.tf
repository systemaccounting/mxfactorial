data "aws_s3_bucket_object" "db_reset_faas" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "db-reset-src.zip"
}

resource "aws_lambda_function" "db_reset_faas" {
  function_name     = "db-reset-faas-${var.environment}"
  description       = "go migrate tool in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.db_reset_faas.bucket
  s3_key            = data.aws_s3_bucket_object.db_reset_faas.key
  s3_object_version = data.aws_s3_bucket_object.db_reset_faas.version_id
  handler           = "index.handler"
  # https://github.com/gkrizek/bash-lambda-layer
  layers = [
    "arn:aws:lambda:${data.aws_region.current.name}:744348701589:layer:bash:8"
  ]
  runtime = "provided"
  timeout = 60 * 10 // 10 mins
  role    = aws_iam_role.db_reset_faas.arn
  environment {
    variables = {
      MIGRATION_LAMBDA_ARN = aws_lambda_function.go_migrate_faas.arn
      PASSPHRASE           = random_password.db_reset_faas.result
    }
  }
}

resource "random_password" "db_reset_faas" {
  length  = 8
  special = false
}

resource "aws_cloudwatch_log_group" "db_reset_faas" {
  name              = "/aws/lambda/${aws_lambda_function.db_reset_faas.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "db_reset_faas" {
  name               = "db-reset-faas-role-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.db_reset_trust_policy.json
}

data "aws_iam_policy_document" "db_reset_trust_policy" {
  version = "2012-10-17"
  statement {
    sid    = "DBResetFaasTrustPolicy${title(var.environment)}"
    effect = "Allow"
    actions = [
      "sts:AssumeRole",
    ]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# allow function to create logs and access rds
resource "aws_iam_role_policy" "db_reset_faas_policy" {
  name = "db-reset-faas-policy-${var.environment}"
  role = aws_iam_role.db_reset_faas.id

  policy = data.aws_iam_policy_document.db_reset_faas_policy.json
}

data "aws_iam_policy_document" "db_reset_faas_policy" {
  version = "2012-10-17"

  statement {
    sid = "DBResetFaasLoggingPolicy${title(var.environment)}"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [
      "*",
    ]
  }

  statement {
    sid = "DBResetFaasInvokePolicy${title(var.environment)}"
    actions = [
      "lambda:InvokeFunction"
    ]
    resources = [
      aws_lambda_function.go_migrate_faas.arn,
    ]
  }
}

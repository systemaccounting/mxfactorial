data "aws_s3_bucket_object" "db_reset" {
  bucket = "mxfactorial-artifacts-${var.env}"
  key    = "db-reset-src.zip"
}

resource "aws_lambda_function" "db_reset" {
  function_name     = "db-reset-${var.env}"
  description       = "go migrate tool in ${var.env}"
  s3_bucket         = data.aws_s3_bucket_object.db_reset.bucket
  s3_key            = data.aws_s3_bucket_object.db_reset.key
  s3_object_version = data.aws_s3_bucket_object.db_reset.version_id
  handler           = "index.handler"
  # https://github.com/gkrizek/bash-lambda-layer
  layers = [
    "arn:aws:lambda:${data.aws_region.current.name}:744348701589:layer:bash:8"
  ]
  runtime = "provided"
  timeout = 60 * 10 // 10 mins
  role    = aws_iam_role.db_reset.arn
  environment {
    variables = {
      MIGRATION_LAMBDA_ARN = aws_lambda_function.go_migrate.arn
      PASSPHRASE           = random_password.db_reset.result
    }
  }
}

resource "random_password" "db_reset" {
  length  = 8
  special = false
}

resource "aws_cloudwatch_log_group" "db_reset" {
  name              = "/aws/lambda/${aws_lambda_function.db_reset.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "db_reset" {
  name               = "db-reset-role-${var.env}"
  assume_role_policy = data.aws_iam_policy_document.db_reset_trust_policy.json
}

data "aws_iam_policy_document" "db_reset_trust_policy" {
  version = "2012-10-17"
  statement {
    sid    = "DBResetFaasTrustPolicy${title(var.env)}"
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
resource "aws_iam_role_policy" "db_reset_policy" {
  name = "db-reset-policy-${var.env}"
  role = aws_iam_role.db_reset.id

  policy = data.aws_iam_policy_document.db_reset_policy.json
}

data "aws_iam_policy_document" "db_reset_policy" {
  version = "2012-10-17"

  statement {
    sid = "DBResetFaasLoggingPolicy${title(var.env)}"
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
    sid = "DBResetFaasInvokePolicy${title(var.env)}"
    actions = [
      "lambda:InvokeFunction"
    ]
    resources = [
      aws_lambda_function.go_migrate.arn,
    ]
  }
}

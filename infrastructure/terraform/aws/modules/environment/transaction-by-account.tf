locals {
  TRANSACTION_BY_ACCOUNT       = "transaction-by-account"
  TRANSACTION_BY_ACCOUNT_TITLE = replace(title(local.TRANSACTION_BY_ACCOUNT), "-", "")
  TRANSACTION_BY_ACCOUNT_DESCR = replace(local.TRANSACTION_BY_ACCOUNT, "-", " ")
  TRANSACTION_BY_ACCOUNT_UPPER = replace(upper(local.TRANSACTION_BY_ACCOUNT), "-", "_")
}

data "aws_s3_bucket_object" "transaction_by_account" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "${local.TRANSACTION_BY_ACCOUNT}-src.zip"
}

resource "aws_lambda_function" "transaction_by_account" {
  function_name     = "${local.TRANSACTION_BY_ACCOUNT}-${var.environment}"
  description       = "${local.TRANSACTION_BY_ACCOUNT} lambda service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.transaction_by_account.bucket
  s3_key            = data.aws_s3_bucket_object.transaction_by_account.key
  s3_object_version = data.aws_s3_bucket_object.transaction_by_account.version_id
  handler           = "index.handler"
  runtime           = "go1.x"
  timeout           = 30
  role              = aws_iam_role.transaction_by_account_role.arn

  environment {
    variables = merge(local.POSTGRES_VARS, {
      RETURN_RECORD_LIMIT = 20
    })
  }
}

resource "aws_cloudwatch_log_group" "transaction_by_account" {
  name              = "/aws/lambda/${aws_lambda_function.transaction_by_account.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "transaction_by_account_role" {
  name               = "${local.TRANSACTION_BY_ACCOUNT}-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.transaction_by_account_trust_policy.json
}

data "aws_iam_policy_document" "transaction_by_account_trust_policy" {
  version = "2012-10-17"
  statement {
    sid    = "${local.TRANSACTION_BY_ACCOUNT_TITLE}LambdaTrustPolicy${title(var.environment)}"
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

resource "aws_iam_role_policy" "transaction_by_account_policy" {
  name = "${local.TRANSACTION_BY_ACCOUNT}-${var.environment}"
  role = aws_iam_role.transaction_by_account_role.id

  policy = data.aws_iam_policy_document.transaction_by_account_policy.json
}

data "aws_iam_policy_document" "transaction_by_account_policy" {
  version = "2012-10-17"
  statement {
    sid = "${local.TRANSACTION_BY_ACCOUNT_TITLE}LoggingPolicy${title(var.environment)}"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "*",
    ]
  }
}

// supports local testing
resource "aws_secretsmanager_secret" "transaction_by_account_lambda_arn" {
  name                    = "${var.environment}/${local.TRANSACTION_BY_ACCOUNT_UPPER}_LAMBDA_ARN"
  recovery_window_in_days = 0
  description             = "${local.TRANSACTION_BY_ACCOUNT_DESCR} arn in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "transaction_by_account_lambda_arn" {
  secret_id     = aws_secretsmanager_secret.transaction_by_account_lambda_arn.id
  secret_string = aws_lambda_function.transaction_by_account.arn
}

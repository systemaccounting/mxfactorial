locals {
  TRANSACTION_BY_ID       = "transaction-by-id"
  TRANSACTION_BY_ID_TITLE = replace(title(local.TRANSACTION_BY_ID), "-", "")
  TRANSACTION_BY_ID_DESCR = replace(local.TRANSACTION_BY_ID, "-", " ")
  TRANSACTION_BY_ID_UPPER = replace(upper(local.TRANSACTION_BY_ID), "-", "_")
}


data "aws_s3_bucket_object" "transaction_by_id" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "${local.TRANSACTION_BY_ID}-src.zip"
}

resource "aws_lambda_function" "transaction_by_id" {
  function_name     = "${local.TRANSACTION_BY_ID}-${var.environment}"
  description       = "${local.TRANSACTION_BY_ID} lambda service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.transaction_by_id.bucket
  s3_key            = data.aws_s3_bucket_object.transaction_by_id.key
  s3_object_version = data.aws_s3_bucket_object.transaction_by_id.version_id
  handler           = "index.handler"
  runtime           = "go1.x"
  timeout           = 30
  role              = aws_iam_role.transaction_by_id_role.arn

  environment {
    variables = merge(local.POSTGRES_VARS, {
      RETURN_RECORD_LIMIT = 20
    })
  }
}

resource "aws_cloudwatch_log_group" "transaction_by_id" {
  name              = "/aws/lambda/${aws_lambda_function.transaction_by_id.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "transaction_by_id_role" {
  name               = "${local.TRANSACTION_BY_ID}-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.transaction_by_id_trust_policy.json
}

data "aws_iam_policy_document" "transaction_by_id_trust_policy" {
  version = "2012-10-17"
  statement {
    sid    = "${replace(title(local.TRANSACTION_BY_ID), "-", "")}LambdaTrustPolicy${title(var.environment)}"
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

resource "aws_iam_role_policy" "transaction_by_id_policy" {
  name = "${local.TRANSACTION_BY_ID}-${var.environment}"
  role = aws_iam_role.transaction_by_id_role.id

  policy = data.aws_iam_policy_document.transaction_by_id_policy.json
}

data "aws_iam_policy_document" "transaction_by_id_policy" {
  version = "2012-10-17"
  statement {
    sid = "${replace(title(local.TRANSACTION_BY_ID), "-", "")}LoggingPolicy${title(var.environment)}"
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
resource "aws_secretsmanager_secret" "transaction_by_id_lambda_arn" {
  name                    = "${var.environment}/${local.TRANSACTION_BY_ID_UPPER}_LAMBDA_ARN"
  recovery_window_in_days = 0
  description             = "${local.TRANSACTION_BY_ID_DESCR} arn in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "transaction_by_id_lambda_arn" {
  secret_id     = aws_secretsmanager_secret.transaction_by_id_lambda_arn.id
  secret_string = aws_lambda_function.transaction_by_id.arn
}

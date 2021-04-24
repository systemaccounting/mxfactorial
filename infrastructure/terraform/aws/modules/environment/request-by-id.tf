locals {
  REQUEST_BY_ID       = "request-by-id"
  REQUEST_BY_ID_TITLE = replace(title(local.REQUEST_BY_ID), "-", "")
  REQUEST_BY_ID_DESCR = replace(local.REQUEST_BY_ID, "-", " ")
  REQUEST_BY_ID_UPPER = replace(upper(local.REQUEST_BY_ID), "-", "_")
}

data "aws_s3_bucket_object" "request_by_id" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "${local.REQUEST_BY_ID}-src.zip"
}

resource "aws_lambda_function" "request_by_id" {
  function_name     = "${local.REQUEST_BY_ID}-${var.environment}"
  description       = "${local.REQUEST_BY_ID} lambda service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.request_by_id.bucket
  s3_key            = data.aws_s3_bucket_object.request_by_id.key
  s3_object_version = data.aws_s3_bucket_object.request_by_id.version_id
  handler           = "index.handler"
  runtime           = "go1.x"
  timeout           = 30
  role              = aws_iam_role.request_by_id_role.arn

  environment {
    variables = merge(local.POSTGRES_VARS, {
      RETURN_RECORD_LIMIT = 20
    })
  }
}

resource "aws_cloudwatch_log_group" "request_by_id" {
  name              = "/aws/lambda/${aws_lambda_function.request_by_id.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "request_by_id_role" {
  name               = "${local.REQUEST_BY_ID}-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.request_by_id_trust_policy.json
}

data "aws_iam_policy_document" "request_by_id_trust_policy" {
  version = "2012-10-17"
  statement {
    sid    = "${local.REQUEST_BY_ID_TITLE}LambdaTrustPolicy${title(var.environment)}"
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

resource "aws_iam_role_policy" "request_by_id_policy" {
  name = "${local.REQUEST_BY_ID}-${var.environment}"
  role = aws_iam_role.request_by_id_role.id

  policy = data.aws_iam_policy_document.request_by_id_policy.json
}

data "aws_iam_policy_document" "request_by_id_policy" {
  version = "2012-10-17"
  statement {
    sid = "${local.REQUEST_BY_ID_TITLE}LoggingPolicy${title(var.environment)}"
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
resource "aws_secretsmanager_secret" "request_by_id_lambda_arn" {
  name                    = "${var.environment}/${local.REQUEST_BY_ID_UPPER}_LAMBDA_ARN"
  recovery_window_in_days = 0
  description             = "${local.REQUEST_BY_ID_DESCR} arn in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "request_by_id_lambda_arn" {
  secret_id     = aws_secretsmanager_secret.request_by_id_lambda_arn.id
  secret_string = aws_lambda_function.request_by_id.arn
}

locals {
  REQUEST_APPROVE       = "request-approve"
  REQUEST_APPROVE_TITLE = replace(title(local.REQUEST_APPROVE), "-", "")
  REQUEST_APPROVE_DESCR = replace(local.REQUEST_APPROVE, "-", " ")
  REQUEST_APPROVE_UPPER = replace(upper(local.REQUEST_APPROVE), "-", "_")
}

data "aws_s3_bucket_object" "request_approve" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "${local.REQUEST_APPROVE}-src.zip"
}

resource "aws_lambda_function" "request_approve" {
  function_name     = "${local.REQUEST_APPROVE}-${var.environment}"
  description       = "${local.REQUEST_APPROVE} lambda service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.request_approve.bucket
  s3_key            = data.aws_s3_bucket_object.request_approve.key
  s3_object_version = data.aws_s3_bucket_object.request_approve.version_id
  handler           = "index.handler"
  runtime           = "go1.x"
  timeout           = 30
  role              = aws_iam_role.request_approve_role.arn
  environment {
    variables = local.POSTGRES_VARS
  }
}

resource "aws_cloudwatch_log_group" "request_approve" {
  name              = "/aws/lambda/${aws_lambda_function.request_approve.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "request_approve_role" {
  name               = "${local.REQUEST_APPROVE}-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.request_approve_trust_policy.json
}

data "aws_iam_policy_document" "request_approve_trust_policy" {
  version = "2012-10-17"
  statement {
    sid    = "${local.REQUEST_APPROVE_TITLE}LambdaTrustPolicy${title(var.environment)}"
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

resource "aws_iam_role_policy" "request_approve_policy" {
  name   = "${local.REQUEST_APPROVE}-${var.environment}"
  role   = aws_iam_role.request_approve_role.id
  policy = data.aws_iam_policy_document.request_approve_policy.json
}

data "aws_iam_policy_document" "request_approve_policy" {
  version = "2012-10-17"
  statement {
    sid = "${local.REQUEST_APPROVE_TITLE}LoggingPolicy${title(var.environment)}"
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
resource "aws_secretsmanager_secret" "request_approve_lambda_arn" {
  name                    = "${var.environment}/${local.REQUEST_APPROVE_UPPER}_LAMBDA_ARN"
  recovery_window_in_days = 0
  description             = "${local.REQUEST_APPROVE_DESCR} arn in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "request_approve_lambda_arn" {
  secret_id     = aws_secretsmanager_secret.request_approve_lambda_arn.id
  secret_string = aws_lambda_function.request_approve.arn
}

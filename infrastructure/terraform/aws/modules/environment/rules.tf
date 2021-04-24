locals {
  RULES = "rules"
}

data "aws_s3_bucket_object" "rules" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "${local.RULES}-src.zip"
}

resource "aws_lambda_function" "rules" {
  function_name     = "${local.RULES}-${var.environment}"
  description       = "${local.RULES} service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.rules.bucket
  s3_key            = data.aws_s3_bucket_object.rules.key
  s3_object_version = data.aws_s3_bucket_object.rules.version_id
  handler           = "index.handler"
  runtime           = "nodejs14.x"
  timeout           = 30
  role              = aws_iam_role.rules.arn

  environment {
    variables = merge(local.POSTGRES_VARS, {
      PG_MAX_CONNECTIONS = 20
      PG_IDLE_TIMEOUT    = 10000
      PG_CONN_TIMEOUT    = 500
    })
  }
}

resource "aws_cloudwatch_log_group" "rules" {
  name              = "/aws/lambda/${aws_lambda_function.rules.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "rules" {
  name               = "${local.RULES}-role-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.rules_trust_policy.json
}

data "aws_iam_policy_document" "rules_trust_policy" {
  version = "2012-10-17"
  statement {
    sid    = "${replace(title(local.RULES), "-", "")}LambdaTrustPolicy${title(var.environment)}"
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

resource "aws_iam_role_policy" "rules_policy" {
  name   = "${local.RULES}-policy-${var.environment}"
  role   = aws_iam_role.rules.id
  policy = data.aws_iam_policy_document.rules_policy.json
}

data "aws_iam_policy_document" "rules_policy" {
  version = "2012-10-17"

  statement {
    sid = "${replace(title(local.RULES), "-", "")}LambdaLoggingPolicy${title(var.environment)}"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["*"]
  }
}

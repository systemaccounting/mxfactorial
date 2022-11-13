locals {
  RULES = "rules"
}

data "aws_s3_bucket_object" "rules" {
  bucket = var.artifacts_bucket_name
  key    = "${local.RULES}-src.zip"
}

resource "aws_lambda_function" "rules" {
  function_name     = "${local.ID_ENV}-${local.RULES}"
  description       = "${local.RULES} service in ${local.SPACED_ID_ENV}"
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
  name               = "${local.ID_ENV}-${local.RULES}-role"
  assume_role_policy = data.aws_iam_policy_document.rules_trust_policy.json
}

data "aws_iam_policy_document" "rules_trust_policy" {
  version = "2012-10-17"
  statement {
    sid    = "${replace(title(local.RULES), "-", "")}LambdaTrustPolicy${local.TITLED_ID_ENV}"
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
  name   = "${local.ID_ENV}-${local.RULES}-policy"
  role   = aws_iam_role.rules.id
  policy = data.aws_iam_policy_document.rules_policy.json
}

data "aws_iam_policy_document" "rules_policy" {
  version = "2012-10-17"

  statement {
    sid = "${replace(title(local.RULES), "-", "")}LambdaLoggingPolicy${local.TITLED_ID_ENV}"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["*"]
  }
}

locals {
  REQUEST_CREATE       = "request-create"
  REQUEST_CREATE_TITLE = replace(title(local.REQUEST_CREATE), "-", "")
  REQUEST_CREATE_DESCR = replace(local.REQUEST_CREATE, "-", " ")
  REQUEST_CREATE_UPPER = replace(upper(local.REQUEST_CREATE), "-", "_")
}

data "aws_s3_bucket_object" "request_create" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "${local.REQUEST_CREATE}-src.zip"
}

resource "aws_lambda_function" "request_create" {
  function_name     = "${local.REQUEST_CREATE}-${var.environment}"
  description       = "${local.REQUEST_CREATE} lambda service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.request_create.bucket
  s3_key            = data.aws_s3_bucket_object.request_create.key
  s3_object_version = data.aws_s3_bucket_object.request_create.version_id
  handler           = "index.handler"
  runtime           = "go1.x"
  timeout           = 30
  role              = aws_iam_role.request_create_role.arn
  environment {
    variables = merge(local.POSTGRES_VARS, {
      RULE_LAMBDA_ARN = aws_lambda_function.rules.arn
    })
  }
}

resource "aws_cloudwatch_log_group" "request_create" {
  name              = "/aws/lambda/${aws_lambda_function.request_create.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "request_create_role" {
  name               = "${local.REQUEST_CREATE}-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.request_create_trust_policy.json
}

data "aws_iam_policy_document" "request_create_trust_policy" {
  version = "2012-10-17"
  statement {
    sid    = "${local.REQUEST_CREATE_TITLE}LambdaTrustPolicy${title(var.environment)}"
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

resource "aws_iam_role_policy" "request_create_policy" {
  name = "${local.REQUEST_CREATE}-${var.environment}"
  role = aws_iam_role.request_create_role.id

  policy = data.aws_iam_policy_document.request_create_policy.json
}

data "aws_iam_policy_document" "request_create_policy" {
  version = "2012-10-17"
  statement {
    sid = "${local.REQUEST_CREATE_TITLE}LoggingPolicy${title(var.environment)}"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "*",
    ]
  }

  statement {
    sid = "${local.REQUEST_CREATE_TITLE}Invoke${title(var.environment)}"
    actions = [
      "lambda:InvokeFunction"
    ]
    resources = [
      aws_lambda_function.rules.arn,
    ]
  }
}

// supports local testing
resource "aws_secretsmanager_secret" "request_create_lambda_arn" {
  name                    = "${var.environment}/${local.REQUEST_CREATE_UPPER}_LAMBDA_ARN"
  recovery_window_in_days = 0
  description             = "${local.REQUEST_CREATE_DESCR} arn in ${var.environment}"
}

resource "aws_secretsmanager_secret_version" "request_create_lambda_arn" {
  secret_id     = aws_secretsmanager_secret.request_create_lambda_arn.id
  secret_string = aws_lambda_function.request_create.arn
}

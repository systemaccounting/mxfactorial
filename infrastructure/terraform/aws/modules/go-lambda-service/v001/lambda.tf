locals {
  SERVICE_NAME_TITLE = replace(title(var.service_name), "-", "")
  SERVICE_NAME_UPPER = replace(upper(var.service_name), "-", "_")
  SERVICE_NAME_LOWER = replace(var.service_name, "-", "_")
  LOG_GROUP_NAME     = "/aws/lambda/${aws_lambda_function.default.function_name}"
}

data "aws_s3_bucket_object" "default" {
  bucket = var.artifacts_bucket_name
  key    = "${var.service_name}-src.zip"
}

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

resource "aws_lambda_function" "default" {
  function_name     = "${var.service_name}-${var.env}"
  description       = "${var.service_name} lambda service in ${var.env}"
  s3_bucket         = data.aws_s3_bucket_object.default.bucket
  s3_key            = data.aws_s3_bucket_object.default.key
  s3_object_version = data.aws_s3_bucket_object.default.version_id
  handler           = "index.handler"
  runtime           = "go1.x"
  timeout           = 30
  role              = aws_iam_role.default.arn
  dynamic "environment" {
    for_each = var.env_vars == null ? [] : [1]
    content { variables = var.env_vars }
  }
}

resource "aws_cloudwatch_log_group" "default" {
  name              = local.LOG_GROUP_NAME
  retention_in_days = 30
}

resource "aws_iam_role" "default" {
  name = "${var.service_name}-${var.env}-lambda"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "${local.SERVICE_NAME_TITLE}LambdaTrustPolicy${title(var.env)}"
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_policy" "default" {
  name        = "${var.service_name}-lambda-logging-${var.env}"
  description = "${aws_lambda_function.default.function_name} logging permission in ${var.env}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "${local.SERVICE_NAME_TITLE}CreateLogGroupPolicy${title(var.env)}"
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup"
        ],
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*"
      },
      {
        Sid    = "${local.SERVICE_NAME_TITLE}LogEventPolicy${title(var.env)}"
        Effect = "Allow",
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = [
          "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:${local.LOG_GROUP_NAME}:*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "default" {
  role       = aws_iam_role.default.name
  policy_arn = aws_iam_policy.default.arn
}

resource "aws_lambda_permission" "default" {
  count         = length(var.invoke_principals)
  statement_id  = "Allow${local.SERVICE_NAME_TITLE}${count.index}Execution${title(var.env)}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.default.function_name
  principal     = var.invoke_principals[count.index]
}

resource "aws_iam_role_policy_attachment" "extra" {
  count      = length(var.attached_policy_arns)
  role       = aws_iam_role.default.name
  policy_arn = var.attached_policy_arns[count.index]
}

resource "aws_ssm_parameter" "default" {
  count       = var.create_secret ? 1 : 0
  name        = "/${var.env}/${var.ssm_version}/service/lambda/${local.SERVICE_NAME_LOWER}/arn"
  description = "${aws_lambda_function.default.function_name} arn in ${var.env}"
  type        = "SecureString"
  value       = aws_lambda_function.default.arn
  tags = {
    env = var.env
  }
}

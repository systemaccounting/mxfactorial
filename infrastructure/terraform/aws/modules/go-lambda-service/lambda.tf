locals {
  SERVICE_NAME_TITLE = replace(title(var.service_name), "-", "")
  SERVICE_NAME_DESCR = replace(var.service_name, "-", " ")
  SERVICE_NAME_UPPER = replace(upper(var.service_name), "-", "_")
}

data "aws_s3_bucket_object" "default" {
  bucket = var.artifacts_bucket_name
  key    = "${var.service_name}-src.zip"
}

resource "aws_lambda_function" "default" {
  function_name     = "${var.service_name}-${var.env}"
  description       = "${local.SERVICE_NAME_DESCR} lambda service in ${var.env}"
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
  name              = "/aws/lambda/${aws_lambda_function.default.function_name}"
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
  description = "${local.SERVICE_NAME_DESCR} logging permission in ${var.env}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "${local.SERVICE_NAME_TITLE}LoggingPolicy${title(var.env)}"
        Action = [
          "logs:PutLogEvents",
          "logs:CreateLogStream",
          "logs:CreateLogGroup",
        ]
        Effect   = "Allow"
        Resource = "*"
      },
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

// supports local testing
resource "aws_secretsmanager_secret" "default" {
  count                   = var.create_secret ? 1 : 0
  name                    = "${var.env}/${local.SERVICE_NAME_UPPER}_LAMBDA_ARN"
  recovery_window_in_days = 0
  description             = "${local.SERVICE_NAME_DESCR} arn in ${var.env}"
}

resource "aws_secretsmanager_secret_version" "default" {
  count         = var.create_secret ? 1 : 0
  secret_id     = aws_secretsmanager_secret.default[count.index].id
  secret_string = aws_lambda_function.default.arn
}

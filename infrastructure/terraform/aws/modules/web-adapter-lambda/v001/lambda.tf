locals {
  ID_ENV             = "${var.env_id}-${var.env}"
  TITLED_ID_ENV      = replace(title(local.ID_ENV), "-", "")
  SPACED_ID_ENV      = replace(local.ID_ENV, "-", " ")
  SERVICE_NAME_TITLE = replace(title(var.service_name), "-", "")
  SERVICE_NAME_UPPER = replace(upper(var.service_name), "-", "_")
  SERVICE_NAME_LOWER = replace(var.service_name, "-", "_")
  LOG_GROUP_NAME     = "/aws/lambda/${aws_lambda_function.default.function_name}"
}

data "aws_s3_object" "default" {
  bucket = var.artifacts_bucket_name
  key    = "${var.service_name}-src.zip"
}

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

resource "aws_lambda_function" "default" {
  function_name     = "${var.service_name}-${local.ID_ENV}"
  description       = "${var.service_name} lambda service in ${local.SPACED_ID_ENV}"
  s3_bucket         = data.aws_s3_object.default.bucket
  s3_key            = data.aws_s3_object.default.key
  s3_object_version = data.aws_s3_object.default.version_id
  handler           = "index.handler"
  runtime           = "provided.al2"
  timeout           = 30
  role              = aws_iam_role.default.arn

  environment {
    variables = merge(
      {
        READINESS_CHECK_PATH = "/healthz"
      },
      var.env_vars,
    )
  }

  layers = [
    "arn:aws:lambda:${data.aws_region.current.name}:753240598075:layer:LambdaAdapterLayerX86:${var.web_adapter_layer_version}"
  ]
}

resource "aws_lambda_function_url" "default" {
  function_name      = aws_lambda_function.default.function_name
  authorization_type = "AWS_IAM"
}

resource "aws_cloudwatch_log_group" "default" {
  name              = local.LOG_GROUP_NAME
  retention_in_days = 30
}

resource "aws_iam_role" "default" {
  name = "${var.service_name}-lambda-${local.ID_ENV}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "${local.SERVICE_NAME_TITLE}LambdaTrustPolicy${local.TITLED_ID_ENV}"
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
  name        = "${var.service_name}-lambda-${local.ID_ENV}"
  description = "${aws_lambda_function.default.function_name} permissions in ${local.SPACED_ID_ENV}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "${local.SERVICE_NAME_TITLE}CreateLogGroupPolicy${local.TITLED_ID_ENV}"
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup"
        ],
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*"
      },
      {
        Sid    = "${local.SERVICE_NAME_TITLE}LogEventPolicy${local.TITLED_ID_ENV}"
        Effect = "Allow",
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = [
          "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:${local.LOG_GROUP_NAME}:*"
        ]
    }],
  })
}

resource "aws_iam_role_policy_attachment" "default" {
  role       = aws_iam_role.default.name
  policy_arn = aws_iam_policy.default.arn
}

resource "aws_lambda_permission" "function_url" {
  count                  = length(var.invoke_url_principals)
  statement_id           = "Allow${local.SERVICE_NAME_TITLE}UrlExecution${local.TITLED_ID_ENV}${count.index}"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.default.function_name
  principal              = var.invoke_url_principals[count.index]
  function_url_auth_type = "AWS_IAM"
}

resource "aws_lambda_permission" "function_arn" {
  count         = length(var.invoke_arn_principals)
  statement_id  = "Allow${local.SERVICE_NAME_TITLE}ArnExecution${local.TITLED_ID_ENV}${count.index}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.default.function_name
  principal     = var.invoke_arn_principals[count.index]
}

resource "aws_iam_role_policy_attachment" "extra" {
  count      = length(var.attached_policy_arns)
  role       = aws_iam_role.default.name
  policy_arn = var.attached_policy_arns[count.index]
}

resource "aws_ssm_parameter" "default" {
  count       = var.create_secret ? 1 : 0
  name        = "/${var.ssm_prefix}/service/lambda/${local.SERVICE_NAME_LOWER}/arn"
  description = "${aws_lambda_function.default.function_name} arn in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = aws_lambda_function.default.arn
}

resource "aws_ssm_parameter" "function_url" {
  count       = var.create_secret ? 1 : 0
  name        = "/${var.ssm_prefix}/service/lambda/${local.SERVICE_NAME_LOWER}/url"
  description = "${aws_lambda_function.default.function_name} url in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = aws_lambda_function_url.default.function_url
}

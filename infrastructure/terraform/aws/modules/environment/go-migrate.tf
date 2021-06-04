data "aws_s3_bucket_object" "go_migrate" {
  bucket = "mxfactorial-artifacts-${var.env}"
  key    = "go-migrate-src.zip"
}

resource "aws_lambda_function" "go_migrate" {
  function_name     = "go-migrate-${var.env}"
  description       = "go migrate tool in ${var.env}"
  s3_bucket         = data.aws_s3_bucket_object.go_migrate.bucket
  s3_key            = data.aws_s3_bucket_object.go_migrate.key
  s3_object_version = data.aws_s3_bucket_object.go_migrate.version_id
  handler           = "index.handler"
  # https://github.com/gkrizek/bash-lambda-layer
  layers = [
    "arn:aws:lambda:${data.aws_region.current.name}:744348701589:layer:bash:8",
    data.aws_lambda_layer_version.go_migrate.arn
  ]
  runtime = "provided"
  timeout = 60
  role    = aws_iam_role.go_migrate.arn

  environment {
    variables = local.POSTGRES_VARS
  }
}

data "aws_lambda_layer_version" "go_migrate" {
  layer_name = "go-migrate-provided-deps-${var.env}"
}

data "aws_s3_bucket_object" "go_migrate_layer" {
  bucket = "mxfactorial-artifacts-${var.env}"
  key    = "go-migrate-layer.zip"
}

resource "aws_cloudwatch_log_group" "go_migrate" {
  name              = "/aws/lambda/${aws_lambda_function.go_migrate.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "go_migrate" {
  name = "go-migrate-role-${var.env}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# allow function to create logs and access rds
resource "aws_iam_role_policy" "go_migrate_policy" {
  name = "go-migrate-policy-${var.env}"
  role = aws_iam_role.go_migrate.id

  policy = data.aws_iam_policy_document.go_migrate_policy.json
}

data "aws_iam_policy_document" "go_migrate_policy" {
  version = "2012-10-17"

  statement {
    sid = "GoMigrateFaasLoggingPolicy${title(var.env)}"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [
      "*",
    ]
  }

  statement {
    sid = "GoMigrateFaasEc2AccessPolicy${title(var.env)}"
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DeleteNetworkInterface"
    ]
    resources = [
      "*", # todo: restrict
    ]
  }
}

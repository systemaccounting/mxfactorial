data "aws_s3_object" "go_migrate" {
  bucket = var.artifacts_bucket_name
  key    = "go-migrate-src.zip"
}

resource "aws_lambda_function" "go_migrate" {
  function_name     = "go-migrate-${local.ID_ENV}"
  description       = "go migrate tool in ${local.SPACED_ID_ENV}"
  s3_bucket         = data.aws_s3_object.go_migrate.bucket
  s3_key            = data.aws_s3_object.go_migrate.key
  s3_object_version = data.aws_s3_object.go_migrate.version_id
  handler           = "index.handler"
  # https://github.com/gkrizek/bash-lambda-layer
  layers = [
    "arn:aws:lambda:${data.aws_region.current.name}:744348701589:layer:bash:8",
    data.aws_lambda_layer_version.go_migrate.arn
  ]
  runtime = "provided"
  timeout = 60 // 1 min
  role    = aws_iam_role.go_migrate.arn

  environment {
    variables = local.POSTGRES_VARS
  }
}

data "aws_lambda_layer_version" "go_migrate" {
  layer_name = "${local.GO_MIGRATE_LAYER_SUFFIX}-${local.ID_ENV}"
}

data "aws_s3_object" "go_migrate_layer" {
  bucket = var.artifacts_bucket_name
  key    = "go-migrate-layer.zip"
}

resource "aws_cloudwatch_log_group" "go_migrate" {
  name              = "/aws/lambda/${aws_lambda_function.go_migrate.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "go_migrate" {
  name = "go-migrate-role-${local.ID_ENV}"

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
  name = "go-migrate-policy-${local.ID_ENV}"
  role = aws_iam_role.go_migrate.id

  policy = data.aws_iam_policy_document.go_migrate_policy.json
}

data "aws_iam_policy_document" "go_migrate_policy" {
  version = "2012-10-17"

  statement {
    sid = "GoMigrateFaasLoggingPolicy${local.TITLED_ID_ENV}"
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
    sid = "GoMigrateFaasEc2AccessPolicy${local.TITLED_ID_ENV}"
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

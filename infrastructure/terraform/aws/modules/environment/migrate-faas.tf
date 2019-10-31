data "aws_s3_bucket_object" "migrate_lambda" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "migrate-src.zip"
}

resource "aws_lambda_function" "migrate_lambda" {
  function_name     = "migrate-lambda-${var.environment}"
  description       = "transact service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.migrate_lambda.bucket
  s3_key            = data.aws_s3_bucket_object.migrate_lambda.key
  s3_object_version = data.aws_s3_bucket_object.migrate_lambda.version_id
  handler           = "index.handler"
  runtime           = "nodejs8.10"
  role              = aws_iam_role.migrate_lambda_role.arn

  layers = [
    data.aws_lambda_layer_version.migrate_lambda.arn,

    # https://github.com/gkrizek/bash-lambda-layer
    "arn:aws:lambda:${data.aws_region.current.name}:744348701589:layer:bash:8",
  ]

  environment {
    variables = local.POSTGRES_VARS
  }

  timeout = 30
}

resource "aws_cloudwatch_log_group" "migrate_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.migrate_lambda.function_name}"
  retention_in_days = 30
}

data "aws_lambda_layer_version" "migrate_lambda" {
  layer_name = "migrate-node-deps-${var.environment}"
}

data "aws_s3_bucket_object" "migrate_lambda_layer" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "migrate-layer.zip"
}

resource "aws_iam_role" "migrate_lambda_role" {
  name = "migrate-lambda-role-${var.environment}"

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

# policy for lambda to create logs and access rds
resource "aws_iam_role_policy" "migrate_lambda_policy" {
  name   = "migrate-lambda-policy-${var.environment}"
  role   = aws_iam_role.migrate_lambda_role.id
  policy = data.aws_iam_policy_document.migrate_lambda_policy.json
}

data "aws_iam_policy_document" "migrate_lambda_policy" {
  version = "2012-10-17"

  statement {
    sid = "MigrateLambdaLoggingPolicy${title(var.environment)}"
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
    sid = "MigrateLambdaEc2AccessPolicy${title(var.environment)}"
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

resource "aws_iam_role_policy_attachment" "rds_access_for_migrate_lambda" {
  role       = aws_iam_role.migrate_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

data "aws_s3_bucket_object" "go_migrate_faas" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "go-migrate-src.zip"
}

resource "aws_lambda_function" "go_migrate_faas" {
  function_name     = "go-migrate-faas-${var.environment}"
  description       = "go migrate tool in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.go_migrate_faas.bucket
  s3_key            = data.aws_s3_bucket_object.go_migrate_faas.key
  s3_object_version = data.aws_s3_bucket_object.go_migrate_faas.version_id
  handler           = "index.handler"
  # https://github.com/gkrizek/bash-lambda-layer
  layers  = ["arn:aws:lambda:${data.aws_region.current.name}:744348701589:layer:bash:8"]
  runtime = "provided"
  timeout = 60
  role    = aws_iam_role.go_migrate_faas.arn
}

resource "aws_cloudwatch_log_group" "go_migrate_faas" {
  name              = "/aws/lambda/${aws_lambda_function.go_migrate_faas.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "go_migrate_faas" {
  name = "go-migrate-faas-role-${var.environment}"

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

# Policy for Lambda to create logs and access rds
resource "aws_iam_role_policy" "go_migrate_faas_policy" {
  name = "go-migrate-faas-policy-${var.environment}"
  role = aws_iam_role.go_migrate_faas.id

  policy = data.aws_iam_policy_document.go_migrate_faas_policy.json
}

data "aws_iam_policy_document" "go_migrate_faas_policy" {
  version = "2012-10-17"

  statement {
    sid = "GoMigrateFaasLoggingPolicy${title(var.environment)}"
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
    sid = "GoMigrateFaasEc2AccessPolicy${title(var.environment)}"
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

resource "aws_iam_role_policy_attachment" "go_migrate_faas_rds_access" {
  role       = aws_iam_role.go_migrate_faas.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

data "aws_s3_bucket_object" "request_query" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "request-query-src.zip"
}

resource "aws_lambda_function" "request_query" {
  function_name     = "request-query-${var.environment}"
  description       = "request query service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.request_query.bucket
  s3_key            = data.aws_s3_bucket_object.request_query.key
  s3_object_version = data.aws_s3_bucket_object.request_query.version_id
  handler           = "index.handler"
  runtime           = "go1.x"
  timeout           = 30
  role              = aws_iam_role.request_query_role.arn

  environment {
    variables = local.POSTGRES_VARS
  }
}

resource "aws_cloudwatch_log_group" "request_query" {
  name              = "/aws/lambda/${aws_lambda_function.request_query.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "request_query_role" {
  name = "request-query-lambda-role-${var.environment}"

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
resource "aws_iam_role_policy" "request_query_policy" {
  name = "request-query-lambda-policy-${var.environment}"
  role = aws_iam_role.request_query_role.id

  policy = data.aws_iam_policy_document.request_query_policy.json
}

data "aws_iam_policy_document" "request_query_policy" {
  version = "2012-10-17"

  statement {
    sid = "RequestsQueryLambdaLoggingPolicy${title(var.environment)}"
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
    sid = "RequestsQueryLambdaEc2AccessPolicy${title(var.environment)}"
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

resource "aws_iam_role_policy_attachment" "rds_access_for_request_query" {
  role       = aws_iam_role.request_query_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

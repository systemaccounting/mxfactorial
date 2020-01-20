data "aws_s3_bucket_object" "req_query_account" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "req-query-account-src.zip"
}

resource "aws_lambda_function" "req_query_account" {
  function_name     = "req-query-account-${var.environment}"
  description       = "request query by account service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.req_query_account.bucket
  s3_key            = data.aws_s3_bucket_object.req_query_account.key
  s3_object_version = data.aws_s3_bucket_object.req_query_account.version_id
  handler           = "index.handler"
  runtime           = "go1.x"
  timeout           = 30
  role              = aws_iam_role.req_query_account_role.arn

  environment {
    variables = local.POSTGRES_VARS
  }
}

resource "aws_cloudwatch_log_group" "req_query_account" {
  name              = "/aws/lambda/${aws_lambda_function.req_query_account.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "req_query_account_role" {
  name = "req-query-account-lambda-role-${var.environment}"

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
resource "aws_iam_role_policy" "req_query_account_policy" {
  name = "req-query-account-lambda-policy-${var.environment}"
  role = aws_iam_role.req_query_account_role.id

  policy = data.aws_iam_policy_document.req_query_account_policy.json
}

data "aws_iam_policy_document" "req_query_account_policy" {
  version = "2012-10-17"

  statement {
    sid = "RequestQueryByAccountLambdaLoggingPolicy${title(var.environment)}"
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
    sid = "RequestQueryByAccountLambdaEc2AccessPolicy${title(var.environment)}"
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

resource "aws_iam_role_policy_attachment" "rds_access_for_req_query_account" {
  role       = aws_iam_role.req_query_account_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

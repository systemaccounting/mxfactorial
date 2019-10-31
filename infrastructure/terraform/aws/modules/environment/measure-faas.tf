data "aws_s3_bucket_object" "measure_service_lambda" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "measure-src.zip"
}

resource "aws_lambda_function" "measure_service_lambda" {
  function_name     = "measure-lambda-${var.environment}"
  description       = "measure service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.measure_service_lambda.bucket
  s3_key            = data.aws_s3_bucket_object.measure_service_lambda.key
  s3_object_version = data.aws_s3_bucket_object.measure_service_lambda.version_id
  # name of go executable instead of js file and exported function
  handler = "index.handler"
  timeout = 30
  runtime = "go1.x"
  role    = aws_iam_role.measure_service_lambda_role.arn

  environment {
    variables = local.POSTGRES_VARS
  }
}

resource "aws_cloudwatch_log_group" "measure_service_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.measure_service_lambda.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "measure_service_lambda_role" {
  name = "measure-service-lambda-role-${var.environment}"

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

# Policy for Lambda to create logs and dynamodb records
resource "aws_iam_role_policy" "measure_service_lambda_policy" {
  name = "measure-service-lambda-policy-${var.environment}"
  role = aws_iam_role.measure_service_lambda_role.id

  policy = data.aws_iam_policy_document.measure_service_lambda_policy.json
}

data "aws_iam_policy_document" "measure_service_lambda_policy" {
  statement {
    sid = "MeasureLambdaLoggingPolicy${title(var.environment)}"
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
    sid = "MeasureLambdaVpcAccessPolicy${title(var.environment)}"
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DeleteNetworkInterface",
      "ec2:DescribeNetworkInterfaces"
    ]
    resources = [
      "*", # todo: restrict
    ]
  }
}

resource "aws_iam_role_policy_attachment" "rds_access_for_measure_lambda" {
  role       = aws_iam_role.measure_service_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

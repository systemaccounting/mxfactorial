data "aws_s3_bucket_object" "clone_tool_lambda" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "clone-src.zip"
}

resource "aws_lambda_function" "clone_tool_lambda" {
  function_name     = "clone-tool-lambda-${var.environment}"
  description       = "clone tool in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.clone_tool_lambda.bucket
  s3_key            = data.aws_s3_bucket_object.clone_tool_lambda.key
  s3_object_version = data.aws_s3_bucket_object.clone_tool_lambda.version_id
  handler           = "index.handler"
  # https://github.com/gkrizek/bash-lambda-layer
  layers  = ["arn:aws:lambda:${data.aws_region.current.name}:744348701589:layer:bash:8"]
  runtime = "nodejs8.10"
  timeout = 60
  role    = aws_iam_role.clone_tool_lambda.arn

  environment {
    variables = {
      MIGRATE_LAMBDA_ARN = aws_lambda_function.migrate_lambda.arn
    }
  }
}

resource "aws_cloudwatch_log_group" "clone_tool_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.clone_tool_lambda.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "clone_tool_lambda" {
  name = "clone-tool-lambda-role-${var.environment}"

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
resource "aws_iam_role_policy" "clone_tool_lambda_policy" {
  name = "clone-tool-lambda-policy-${var.environment}"
  role = aws_iam_role.clone_tool_lambda.id

  policy = data.aws_iam_policy_document.clone_tool_lambda_policy.json
}

data "aws_iam_policy_document" "clone_tool_lambda_policy" {
  version = "2012-10-17"

  statement {
    sid = "CloneToolLambdaLoggingPolicy${title(var.environment)}"
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
    sid = "CloneToolLambdaInvokePolicy${title(var.environment)}"
    actions = [
      "lambda:InvokeFunction"
    ]
    resources = [
      aws_lambda_function.migrate_lambda.arn,
      aws_lambda_function.integration_test_data_teardown_lambda.arn
    ]
  }
}

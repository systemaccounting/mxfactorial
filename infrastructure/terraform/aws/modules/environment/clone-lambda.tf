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
  layers  = ["arn:aws:lambda:${data.aws_region.current.name}:744348701589:layer:bash:5"]
  runtime = "nodejs8.10"
  timeout = 60
  role    = aws_iam_role.clone_tool_lambda.arn

  environment {
    variables = {
      # workaround for aws_api_gateway_deployment.transact.invoke_url cycle error:
      # SCHEMA_UPDATE_URL        = "https://${aws_api_gateway_rest_api.schema_update_tool_lambda.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
      SCHEMA_UPDATE_LAMBDA_ARN = aws_lambda_function.schema_update_tool_lambda.arn

      WARM_UP_LAMBDA_ARN = aws_lambda_function.integration_test_data_teardown_lambda.arn
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

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": [
        "${aws_lambda_function.schema_update_tool_lambda.arn}",
        "${aws_lambda_function.integration_test_data_teardown_lambda.arn}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

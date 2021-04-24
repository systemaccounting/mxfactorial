# s3 only offers InvokeFunction from event:
# https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html
# below adds UpdateFunctionCode from s3
data "aws_s3_bucket_object" "deploy_lambda" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "deploy-lambda-src.zip"
}

resource "aws_lambda_function" "deploy_lambda" {
  description       = "deploys lambda artifacts stored in s3 ${var.environment}"
  function_name     = "deploy-lambda-${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.deploy_lambda.bucket
  s3_key            = data.aws_s3_bucket_object.deploy_lambda.key
  s3_object_version = data.aws_s3_bucket_object.deploy_lambda.version_id
  role              = aws_iam_role.deploy_lambda.arn
  handler           = "index.handler"
  runtime           = "nodejs10.x"
  timeout           = 30
}

resource "aws_cloudwatch_log_group" "deploy_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.deploy_lambda.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "deploy_lambda" {
  name = "deploy-lambda-role-${var.environment}"

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

data "aws_s3_bucket" "artifacts" {
  bucket = "mxfactorial-artifacts-${var.environment}"
}

resource "aws_iam_role_policy" "deploy_lambda" {
  name   = "deploy-lambda-policy-${var.environment}"
  role   = aws_iam_role.deploy_lambda.id
  policy = data.aws_iam_policy_document.deploy_lambda.json
}

data "aws_iam_policy_document" "deploy_lambda" {
  statement {
    sid = "DeployLambdaLogging${title(var.environment)}"

    effect = "Allow"

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
    sid = "DeployLambdaUpdateCode${title(var.environment)}"

    effect = "Allow"

    actions = [
      "lambda:UpdateFunctionCode",
      "lambda:PublishLayerVersion",
      "lambda:UpdateFunctionConfiguration",
      "lambda:ListFunctions",
      "lambda:GetLayerVersion"
    ]

    resources = [
      "*",
    ]
  }

  statement {
    sid = "AllLambdaGetS3Object${title(var.environment)}"

    effect = "Allow"

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${data.aws_s3_bucket.artifacts.arn}/*",
    ]
  }
}

locals {
  lambda_invoke_events  = ["s3:ObjectCreated:*"]
  lambda_allowed_action = "lambda:InvokeFunction"
}

resource "aws_lambda_permission" "allow_deploy_lambda_invoke_from_s3" {
  statement_id  = "AllowDeployLambdaInvoke${var.environment}"
  action        = local.lambda_allowed_action
  function_name = aws_lambda_function.deploy_lambda.arn
  principal     = "s3.amazonaws.com"
  source_arn    = data.aws_s3_bucket.artifacts.arn
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = data.aws_s3_bucket.artifacts.id

  lambda_function {
    # name of function to deploy
    id = aws_lambda_function.graphql.function_name
    # name of lambda performing deployment
    lambda_function_arn = aws_lambda_permission.allow_deploy_lambda_invoke_from_s3.function_name
    # s3 event triggering deployment
    events = local.lambda_invoke_events
    # s3 object triggering deployment
    filter_prefix = data.aws_s3_bucket_object.graphql.key
  }

  lambda_function {
    id                  = data.aws_lambda_layer_version.graphql.layer_name
    lambda_function_arn = aws_lambda_permission.allow_deploy_lambda_invoke_from_s3.function_name
    events              = local.lambda_invoke_events
    filter_prefix       = data.aws_s3_bucket_object.graphql_layer.key
  }

  lambda_function {
    id                  = aws_lambda_function.cognito_account_auto_confirm.function_name
    lambda_function_arn = aws_lambda_permission.allow_deploy_lambda_invoke_from_s3.function_name
    events              = local.lambda_invoke_events
    filter_prefix       = data.aws_s3_bucket_object.cognito_account_auto_confirm.key
  }

  lambda_function {
    id                  = aws_lambda_function.delete_faker_cognito_accounts_lambda.function_name
    lambda_function_arn = aws_lambda_permission.allow_deploy_lambda_invoke_from_s3.function_name
    events              = local.lambda_invoke_events
    filter_prefix       = data.aws_s3_bucket_object.delete_faker_cognito_accounts_lambda.key
  }

  lambda_function {
    id                  = aws_lambda_function.integration_test_data_teardown_lambda.function_name
    lambda_function_arn = aws_lambda_permission.allow_deploy_lambda_invoke_from_s3.function_name
    events              = local.lambda_invoke_events
    filter_prefix       = data.aws_s3_bucket_object.integration_test_data_teardown_lambda.key
  }

  lambda_function {
    id                  = aws_lambda_function.deploy_lambda.function_name
    lambda_function_arn = aws_lambda_permission.allow_deploy_lambda_invoke_from_s3.function_name
    events              = local.lambda_invoke_events
    filter_prefix       = data.aws_s3_bucket_object.deploy_lambda.key
  }
}

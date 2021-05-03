locals {
  GO_GRAPHQL = "go-graphql"
}

data "aws_s3_bucket_object" "go_graphql" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "${local.GO_GRAPHQL}-src.zip"
}

resource "aws_lambda_function" "go_graphql" {
  function_name     = "${local.GO_GRAPHQL}-${var.environment}"
  description       = "${local.GO_GRAPHQL} on api gateway"
  s3_bucket         = data.aws_s3_bucket_object.go_graphql.bucket
  s3_key            = data.aws_s3_bucket_object.go_graphql.key
  s3_object_version = data.aws_s3_bucket_object.go_graphql.version_id
  handler           = "index.handler"
  runtime           = "go1.x"
  timeout           = 30
  role              = aws_iam_role.go_graphql_role.arn
  environment {
    variables = {
      RULE_LAMBDA_ARN                    = aws_lambda_function.rules.arn
      REQUEST_CREATE_LAMBDA_ARN          = module.request_create.lambda_arn,
      REQUEST_APPROVE_LAMBDA_ARN         = module.request_approve.lambda_arn
      REQUEST_BY_ID_LAMBDA_ARN           = module.request_by_id.lambda_arn,
      REQUESTS_BY_ACCOUNT_LAMBDA_ARN     = module.requests_by_account.lambda_arn,
      TRANSACTIONS_BY_ACCOUNT_LAMBDA_ARN = module.transactions_by_account.lambda_arn
      TRANSACTION_BY_ID_LAMBDA_ARN       = module.transaction_by_id.lambda_arn
      ENABLE_API_AUTH                    = var.enable_api_auth
    }
  }
}

resource "aws_cloudwatch_log_group" "go_graphql" {
  name              = "/aws/lambda/${aws_lambda_function.go_graphql.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "go_graphql_role" {
  name               = "${local.GO_GRAPHQL}-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.go_graphql_trust_policy.json
}

data "aws_iam_policy_document" "go_graphql_trust_policy" {
  version = "2012-10-17"
  statement {
    sid    = "GoGraphQLFaasTrustPolicy${title(var.environment)}"
    effect = "Allow"
    actions = [
      "sts:AssumeRole",
    ]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "go_graphql_policy" {
  name = "${local.GO_GRAPHQL}-${var.environment}"
  role = aws_iam_role.go_graphql_role.id

  policy = data.aws_iam_policy_document.go_graphql_policy.json
}

data "aws_iam_policy_document" "go_graphql_policy" {
  version = "2012-10-17"

  statement {
    sid = "GoGraphQLInvokeLambdaPolicy${title(var.environment)}"
    actions = [
      "lambda:InvokeFunction"
    ]
    resources = [
      aws_lambda_function.rules.arn,
      module.request_create.lambda_arn,
      module.request_approve.lambda_arn,
      module.request_by_id.lambda_arn,
      module.requests_by_account.lambda_arn,
      module.transactions_by_account.lambda_arn,
      module.transaction_by_id.lambda_arn,
    ]
  }

  statement {
    sid = "GoGraphQLLoggingPolicy${title(var.environment)}"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "*",
    ]
  }
}

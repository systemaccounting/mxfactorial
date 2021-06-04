locals {
  GRAPHQL = "graphql"
}

data "aws_s3_bucket_object" "graphql" {
  bucket = "mxfactorial-artifacts-${var.env}"
  key    = "${local.GRAPHQL}-src.zip"
}

resource "aws_lambda_function" "graphql" {
  function_name     = "${local.GRAPHQL}-${var.env}"
  description       = "${local.GRAPHQL} on api gateway"
  s3_bucket         = data.aws_s3_bucket_object.graphql.bucket
  s3_key            = data.aws_s3_bucket_object.graphql.key
  s3_object_version = data.aws_s3_bucket_object.graphql.version_id
  handler           = "index.handler"
  runtime           = "go1.x"
  timeout           = 30
  role              = aws_iam_role.graphql_role.arn
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
      BALANCE_BY_ACCOUNT_LAMBDA_ARN      = module.balance_by_account.lambda_arn
    }
  }
}

resource "aws_cloudwatch_log_group" "graphql" {
  name              = "/aws/lambda/${aws_lambda_function.graphql.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "graphql_role" {
  name               = "${local.GRAPHQL}-${var.env}"
  assume_role_policy = data.aws_iam_policy_document.graphql_trust_policy.json
}

data "aws_iam_policy_document" "graphql_trust_policy" {
  version = "2012-10-17"
  statement {
    sid    = "GraphQLFaasTrustPolicy${title(var.env)}"
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

resource "aws_iam_role_policy" "graphql_policy" {
  name = "${local.GRAPHQL}-${var.env}"
  role = aws_iam_role.graphql_role.id

  policy = data.aws_iam_policy_document.graphql_policy.json
}

data "aws_iam_policy_document" "graphql_policy" {
  version = "2012-10-17"

  statement {
    sid = "GraphQLInvokeLambdaPolicy${title(var.env)}"
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
      module.balance_by_account.lambda_arn,
    ]
  }

  statement {
    sid = "GraphQLLoggingPolicy${title(var.env)}"
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

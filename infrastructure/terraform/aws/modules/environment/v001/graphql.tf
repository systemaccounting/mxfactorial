locals {
  GRAPHQL = "graphql"
}

data "aws_s3_object" "graphql" {
  bucket = var.artifacts_bucket_name
  key    = "${local.GRAPHQL}-src.zip"
}

resource "aws_lambda_function" "graphql" {
  function_name     = "${local.GRAPHQL}-${local.ID_ENV}"
  description       = "${local.GRAPHQL} on api gateway in ${local.SPACED_ID_ENV}"
  s3_bucket         = data.aws_s3_object.graphql.bucket
  s3_key            = data.aws_s3_object.graphql.key
  s3_object_version = data.aws_s3_object.graphql.version_id
  handler           = "index.handler"
  runtime           = "provided.al2"
  timeout           = 30
  role              = aws_iam_role.graphql_role.arn
  environment {
    variables = {
      ENABLE_API_AUTH             = var.enable_api_auth
      RULE_URL                    = module.rule.lambda_function_url
      REQUEST_CREATE_URL          = module.request_create.lambda_function_url
      REQUEST_APPROVE_URL         = module.request_approve.lambda_function_url
      REQUEST_BY_ID_URL           = module.request_by_id.lambda_function_url
      REQUESTS_BY_ACCOUNT_URL     = module.requests_by_account.lambda_function_url
      TRANSACTIONS_BY_ACCOUNT_URL = module.transactions_by_account.lambda_function_url
      TRANSACTION_BY_ID_URL       = module.transaction_by_id.lambda_function_url
      BALANCE_BY_ACCOUNT_URL      = module.balance_by_account.lambda_function_url
      READINESS_CHECK_PATH        = "/healthz"
    }
  }
  layers = [
    "arn:aws:lambda:${data.aws_region.current.name}:753240598075:layer:LambdaAdapterLayerX86:${var.web_adapter_layer_version}"
  ]
}

resource "aws_cloudwatch_log_group" "graphql" {
  name              = "/aws/lambda/${aws_lambda_function.graphql.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "graphql_role" {
  name               = "${local.GRAPHQL}-${local.ID_ENV}"
  assume_role_policy = data.aws_iam_policy_document.graphql_trust_policy.json
}

data "aws_iam_policy_document" "graphql_trust_policy" {
  version = "2012-10-17"
  statement {
    sid    = "GraphQLFaasTrustPolicy${local.TITLED_ID_ENV}"
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
    sid = "GraphQLInvokeLambdaPolicy${local.TITLED_ID_ENV}"
    actions = [
      "lambda:InvokeFunction"
    ]
    resources = [
      module.rule.lambda_arn,
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
    sid = "GraphQLLoggingPolicy${local.TITLED_ID_ENV}"
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

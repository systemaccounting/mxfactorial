data "aws_s3_bucket_object" "graphql" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "graphql-src.zip"
}

resource "aws_lambda_function" "graphql" {
  function_name     = "graphql-${var.environment}"
  description       = "graphql on api gateway"
  s3_bucket         = data.aws_s3_bucket_object.graphql.bucket
  s3_key            = data.aws_s3_bucket_object.graphql.key
  s3_object_version = data.aws_s3_bucket_object.graphql.version_id
  handler           = "index.handler"
  layers            = [data.aws_lambda_layer_version.graphql.arn]
  runtime           = "nodejs10.x"
  timeout           = 30
  role              = aws_iam_role.graphql_role.arn

  environment {
    variables = {
      RULES_FAAS_ARN                                 = aws_lambda_function.rules_faas.arn
      REQUEST_CREATE_LAMBDA_ARN                      = aws_lambda_function.request_create.arn
      REQUEST_APPROVE_LAMBDA_ARN                     = aws_lambda_function.request_approve.arn
      REQUEST_QUERY_BY_TRANSACTION_ID_LAMBDA_ARN     = aws_lambda_function.req_query_trans_id.arn
      REQUEST_QUERY_BY_ACCOUNT_LAMBDA_ARN            = aws_lambda_function.req_query_account.arn
      TRANSACTION_QUERY_BY_TRANSACTION_ID_LAMBDA_ARN = aws_lambda_function.trans_query_id.arn
      TRANSACTION_QUERY_BY_ACCOUNT_LAMBDA_ARN        = aws_lambda_function.trans_query_account.arn
      JWKS_URL = join("", [
        "https://cognito-idp.",
        data.aws_region.current.name,
        ".amazonaws.com/",
        aws_cognito_user_pool.pool.id,
        "/.well-known/jwks.json"
      ])
      RULE_INSTANCES_TABLE_NAME = aws_dynamodb_table.rule_instances.name
    }
  }
}

resource "aws_cloudwatch_log_group" "graphql" {
  name              = "/aws/lambda/${aws_lambda_function.graphql.function_name}"
  retention_in_days = 30
}

data "aws_lambda_layer_version" "graphql" {
  layer_name = "graphql-node-deps-${var.environment}"
}

data "aws_s3_bucket_object" "graphql_layer" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "graphql-layer.zip"
}

resource "aws_iam_role" "graphql_role" {
  name = "graphql-${var.environment}"

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

resource "aws_iam_role_policy" "graphql_policy" {
  name = "graphql-${var.environment}"
  role = aws_iam_role.graphql_role.id

  policy = data.aws_iam_policy_document.graphql_policy.json
}

data "aws_iam_policy_document" "graphql_policy" {
  version = "2012-10-17"

  statement {
    sid = "GraphQLInvokeLambdaPolicy${title(var.environment)}"
    actions = [
      "lambda:InvokeFunction"
    ]
    resources = [
      aws_lambda_function.rules_faas.arn,
      aws_lambda_function.request_create.arn,
      aws_lambda_function.request_approve.arn,
      aws_lambda_function.req_query_trans_id.arn,
      aws_lambda_function.req_query_account.arn,
      aws_lambda_function.trans_query_id.arn,
      aws_lambda_function.trans_query_account.arn
    ]
  }

  statement {
    sid = "GraphQLLoggingPolicy${title(var.environment)}"
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
    sid = "GraphQLLambdaDynamoDbPolicy${title(var.environment)}"
    actions = [
      "dynamodb:BatchGetItem",
      "dynamodb:BatchWriteItem",
      "dynamodb:ConditionCheck",
      "dynamodb:GetItem",
      "dynamodb:GetRecords",
      "dynamodb:Query",
      "dynamodb:Scan"
    ]
    resources = [
      aws_dynamodb_table.rule_instances.arn,
      # if indexes added later:
      # "${aws_dynamodb_table.rule_instances.arn}/index/*"
    ]
  }
}

resource "aws_iam_role_policy_attachment" "rds_access_for_lambda" {
  role       = aws_iam_role.graphql_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

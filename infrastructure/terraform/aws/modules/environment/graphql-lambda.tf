data "aws_s3_bucket_object" "mxfactorial_graphql_server" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "graphql-src.zip"
}

resource "aws_lambda_function" "mxfactorial_graphql_server" {
  function_name     = "mxfactorial-graphql-server-${var.environment}"
  description       = "GraphQL server published on API Gateway"
  s3_bucket         = data.aws_s3_bucket_object.mxfactorial_graphql_server.bucket
  s3_key            = data.aws_s3_bucket_object.mxfactorial_graphql_server.key
  s3_object_version = data.aws_s3_bucket_object.mxfactorial_graphql_server.version_id
  handler           = "index.handler"
  layers            = [data.aws_lambda_layer_version.mxfactorial_graphql_server.arn]
  runtime           = "nodejs8.10"
  timeout           = 30
  role              = aws_iam_role.mxfactorial_graphql_lambda_role.arn

  environment {
    variables = {
      RULES_LAMBDA_ARN    = aws_lambda_function.rules_service_lambda.arn
      TRANSACT_LAMBDA_ARN = aws_lambda_function.transact_service_lambda.arn
      MEASURE_LAMBDA_ARN  = aws_lambda_function.measure_service_lambda.arn
    }
  }
}

resource "aws_cloudwatch_log_group" "mxfactorial_graphql_server" {
  name              = "/aws/lambda/${aws_lambda_function.mxfactorial_graphql_server.function_name}"
  retention_in_days = 30
}

data "aws_lambda_layer_version" "mxfactorial_graphql_server" {
  layer_name = "graphql-node-deps-${var.environment}"
}

data "aws_s3_bucket_object" "graphql_layer" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "graphql-layer.zip"
}

resource "aws_iam_role" "mxfactorial_graphql_lambda_role" {
  name = "mxfactorial-graphql-lambda-${var.environment}"

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

resource "aws_iam_role_policy" "mxfactorial_graphql_lambda_policy" {
  name = "mxfactorial-graphql-lambda-${var.environment}"
  role = aws_iam_role.mxfactorial_graphql_lambda_role.id

  policy = data.aws_iam_policy_document.mxfactorial_graphql_lambda_policy.json
}

data "aws_iam_policy_document" "mxfactorial_graphql_lambda_policy" {
  version = "2012-10-17"

  statement {
    sid = "GraphQLInvokeLambdaPolicy${title(var.environment)}"
    actions = [
      "lambda:InvokeFunction"
    ]
    resources = [
      aws_lambda_function.rules_service_lambda.arn,
      aws_lambda_function.transact_service_lambda.arn,
      aws_lambda_function.measure_service_lambda.arn
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
}

resource "aws_iam_role_policy_attachment" "rds_access_for_lambda" {
  role       = aws_iam_role.mxfactorial_graphql_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

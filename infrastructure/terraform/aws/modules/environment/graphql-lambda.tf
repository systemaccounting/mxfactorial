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
      HOST                = aws_rds_cluster.default.endpoint
      USER                = var.db_master_username
      PASSWORD            = var.db_master_password
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

resource "aws_lambda_layer_version" "graphql_layer" {
  layer_name          = "graphql-node-deps-${var.environment}"
  s3_bucket           = data.aws_s3_bucket_object.graphql_layer.bucket
  s3_key              = data.aws_s3_bucket_object.graphql_layer.key
  s3_object_version   = data.aws_s3_bucket_object.graphql_layer.version_id
  compatible_runtimes = ["nodejs10.x", "nodejs8.10", "nodejs6.10"]
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

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": [
        "${aws_lambda_function.rules_service_lambda.arn}",
        "${aws_lambda_function.transact_service_lambda.arn}",
        "${aws_lambda_function.measure_service_lambda.arn}"
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

resource "aws_iam_role_policy_attachment" "rds_access_for_lambda" {
  role       = aws_iam_role.mxfactorial_graphql_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

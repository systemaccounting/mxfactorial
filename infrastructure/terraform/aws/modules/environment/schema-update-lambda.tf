data "aws_s3_bucket_object" "schema_update_tool_lambda" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "schema-update-src.zip"
}

resource "aws_lambda_function" "schema_update_tool_lambda" {
  function_name     = "schema-update-tool-lambda-${var.environment}"
  description       = "transact service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.schema_update_tool_lambda.bucket
  s3_key            = data.aws_s3_bucket_object.schema_update_tool_lambda.key
  s3_object_version = data.aws_s3_bucket_object.schema_update_tool_lambda.version_id
  handler           = "index.handler"
  runtime           = "nodejs8.10"
  role              = aws_iam_role.schema_update_tool_lambda_role.arn

  layers = [
    data.aws_lambda_layer_version.schema_update_tool_lambda.arn,

    # https://github.com/gkrizek/bash-lambda-layer
    "arn:aws:lambda:${data.aws_region.current.name}:744348701589:layer:bash:5",
  ]

  vpc_config {
    subnet_ids = data.aws_subnet_ids.default.ids

    security_group_ids = [
      aws_security_group.rds.id,
      data.aws_security_group.default.id,
    ]
  }

  environment {
    variables = {
      HOST     = aws_rds_cluster.default.endpoint
      USER     = var.db_master_username
      PASSWORD = var.db_master_password
    }
  }

  timeout = 30
}

resource "aws_cloudwatch_log_group" "schema_update_tool_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.schema_update_tool_lambda.function_name}"
  retention_in_days = 30
}

data "aws_lambda_layer_version" "schema_update_tool_lambda" {
  layer_name = "schema-update-node-deps-${var.environment}"
}

data "aws_s3_bucket_object" "schema_update_layer" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "schema-update-layer.zip"
}

resource "aws_lambda_layer_version" "schema_update_layer" {
  layer_name          = "schema-update-node-deps-${var.environment}"
  s3_bucket           = data.aws_s3_bucket_object.schema_update_layer.bucket
  s3_key              = data.aws_s3_bucket_object.schema_update_layer.key
  s3_object_version   = data.aws_s3_bucket_object.schema_update_layer.version_id
  compatible_runtimes = ["nodejs10.x", "nodejs8.10", "nodejs6.10"]
}

resource "aws_iam_role" "schema_update_tool_lambda_role" {
  name = "schema-update-tool-lambda-role-${var.environment}"

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

# policy for lambda to create logs and access rds
resource "aws_iam_role_policy" "schema_update_tool_lambda_policy" {
  name = "schema-update-tool-lambda-policy-${var.environment}"
  role = aws_iam_role.schema_update_tool_lambda_role.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "rds_access_for_schema_update_tool_lambda" {
  role       = aws_iam_role.schema_update_tool_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

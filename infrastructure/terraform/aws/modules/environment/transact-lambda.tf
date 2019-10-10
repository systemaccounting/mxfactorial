data "aws_s3_bucket_object" "transact_service_lambda" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "transact-src.zip"
}

resource "aws_lambda_function" "transact_service_lambda" {
  function_name     = "transact-lambda-${var.environment}"
  description       = "transact service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.transact_service_lambda.bucket
  s3_key            = data.aws_s3_bucket_object.transact_service_lambda.key
  s3_object_version = data.aws_s3_bucket_object.transact_service_lambda.version_id
  handler           = "index.handler"
  layers            = [data.aws_lambda_layer_version.transact_service_lambda.arn]
  runtime           = "nodejs8.10"
  timeout           = 30
  role              = aws_iam_role.transact_service_lambda_role.arn

  vpc_config {
    subnet_ids = data.aws_subnet_ids.default.ids

    security_group_ids = [
      aws_security_group.rds.id,
      data.aws_security_group.default.id,
      data.aws_security_group.us-east-1_vpce.id
    ]
  }

  environment {
    variables = {
      HOST     = aws_rds_cluster.default.endpoint
      USER     = var.db_master_username
      PASSWORD = var.db_master_password

      # workaround for aws_api_gateway_deployment.rules.invoke_url cycle error:
      RULES_URL = "https://${aws_api_gateway_rest_api.rules.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
    }
  }
}

resource "aws_cloudwatch_log_group" "transact_service_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.transact_service_lambda.function_name}"
  retention_in_days = 30
}


data "aws_lambda_layer_version" "transact_service_lambda" {
  layer_name = "transact-node-deps-${var.environment}"
}

data "aws_s3_bucket_object" "transact_layer" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "transact-layer.zip"
}

resource "aws_lambda_layer_version" "transact_layer" {
  layer_name          = "transact-node-deps-${var.environment}"
  s3_bucket           = data.aws_s3_bucket_object.transact_layer.bucket
  s3_key              = data.aws_s3_bucket_object.transact_layer.key
  s3_object_version   = data.aws_s3_bucket_object.transact_layer.version_id
  compatible_runtimes = ["nodejs10.x", "nodejs8.10", "nodejs6.10"]
}

resource "aws_iam_role" "transact_service_lambda_role" {
  name = "transact-service-lambda-role-${var.environment}"

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
resource "aws_iam_role_policy" "transact_service_lambda_policy" {
  name = "transact-service-lambda-policy-${var.environment}"
  role = aws_iam_role.transact_service_lambda_role.id

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

resource "aws_iam_role_policy_attachment" "rds_access_for_transact_lambda" {
  role       = aws_iam_role.transact_service_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

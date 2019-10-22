data "aws_s3_bucket_object" "rules_service_lambda" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "rules-src.zip"
}

resource "aws_lambda_function" "rules_service_lambda" {
  function_name     = "rules-lambda-${var.environment}"
  description       = "rules service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.rules_service_lambda.bucket
  s3_key            = data.aws_s3_bucket_object.rules_service_lambda.key
  s3_object_version = data.aws_s3_bucket_object.rules_service_lambda.version_id
  handler           = "index.handler"
  layers            = [data.aws_lambda_layer_version.rules_service_lambda.arn]
  runtime           = "nodejs10.x"
  timeout           = 30
  role              = aws_iam_role.rules_service_lambda_role.arn

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
      USER     = var.db_master_username
      PASSWORD = var.db_master_password

      # workaround for aws_api_gateway_deployment.transact.invoke_url cycle error:
      TRANSACT_URL = join(
        "",
        [
          "https://",
          aws_api_gateway_rest_api.transact.id,
          ".execute-api.",
          data.aws_region.current.name,
          ".amazonaws.com/",
          var.environment
        ]
      )
    }
  }
}

resource "aws_cloudwatch_log_group" "rules_service_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.rules_service_lambda.function_name}"
  retention_in_days = 30
}

data "aws_lambda_layer_version" "rules_service_lambda" {
  layer_name = "rules-node-deps-${var.environment}"
}

data "aws_s3_bucket_object" "rules_layer" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "rules-layer.zip"
}

resource "aws_iam_role" "rules_service_lambda_role" {
  name = "rules-service-lambda-role-${var.environment}"

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
resource "aws_iam_role_policy" "rules_service_lambda_policy" {
  name = "rules-service-lambda-policy-${var.environment}"
  role = aws_iam_role.rules_service_lambda_role.id

  policy = data.aws_iam_policy_document.rules_service_lambda_policy.json
}

data "aws_iam_policy_document" "rules_service_lambda_policy" {
  version = "2012-10-17"

  statement {
    sid = "RulesLambdaLoggingPolicy${title(var.environment)}"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["*"]
  }

  statement {
    sid = "RulesLambdaVpcAccessPolicy${title(var.environment)}"
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DeleteNetworkInterface"
    ]
    resources = [
      "*", // todo: restrict
    ]
  }
}

resource "aws_iam_role_policy_attachment" "rds_access_for_rules_lambda" {
  role       = aws_iam_role.rules_service_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

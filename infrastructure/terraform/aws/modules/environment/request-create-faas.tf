data "aws_s3_bucket_object" "request_create" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "request-create-src.zip"
}

resource "aws_lambda_function" "request_create" {
  function_name     = "request-create-${var.environment}"
  description       = "request create service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.request_create.bucket
  s3_key            = data.aws_s3_bucket_object.request_create.key
  s3_object_version = data.aws_s3_bucket_object.request_create.version_id
  handler           = "index.handler"
  layers            = [data.aws_lambda_layer_version.request_create.arn]
  runtime           = "nodejs10.x"
  timeout           = 30
  role              = aws_iam_role.request_create_role.arn

  environment {
    variables = merge(
      {
        NOTIFY_TOPIC_ARN          = aws_sns_topic.notifications.arn,
        RULE_INSTANCES_TABLE_NAME = aws_dynamodb_table.rule_instances.name
      },
      local.POSTGRES_VARS
    )
  }
}

resource "aws_cloudwatch_log_group" "request_create" {
  name              = "/aws/lambda/${aws_lambda_function.request_create.function_name}"
  retention_in_days = 30
}

data "aws_lambda_layer_version" "request_create" {
  layer_name = "request-create-node-deps-${var.environment}"
}

data "aws_s3_bucket_object" "request_create_layer" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "request-create-layer.zip"
}

resource "aws_iam_role" "request_create_role" {
  name = "request-create-service-lambda-role-${var.environment}"

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

# policy for lambda to create logs, access rds and sns
resource "aws_iam_role_policy" "request_create_policy" {
  name = "request-create-service-lambda-policy-${var.environment}"
  role = aws_iam_role.request_create_role.id

  policy = data.aws_iam_policy_document.request_create_policy.json
}

data "aws_iam_policy_document" "request_create_policy" {
  version = "2012-10-17"

  statement {
    sid = "RequestCreateLambdaLoggingPolicy${title(var.environment)}"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [
      "*",
    ]
  }

  statement {
    sid = "RequestCreateLambdaEc2AccessPolicy${title(var.environment)}"
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DeleteNetworkInterface"
    ]
    resources = [
      "*", # todo: restrict
    ]
  }

  statement {
    sid = "RequestCreateLambdaSNSPublishPolicy${title(var.environment)}"
    actions = [
      "SNS:Publish",
    ]
    resources = [
      aws_sns_topic.notifications.arn,
    ]
  }

  statement {
    sid = "RequestCreateLambdaDynamoDbPolicy${title(var.environment)}"
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

resource "aws_iam_role_policy_attachment" "rds_access_for_request_create_lambda" {
  role       = aws_iam_role.request_create_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

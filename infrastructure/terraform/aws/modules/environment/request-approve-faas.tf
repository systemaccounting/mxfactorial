data "aws_s3_bucket_object" "request_approve" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "request-approve-src.zip"
}

resource "aws_lambda_function" "request_approve" {
  function_name     = "request-approve-${var.environment}"
  description       = "request approval service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.request_approve.bucket
  s3_key            = data.aws_s3_bucket_object.request_approve.key
  s3_object_version = data.aws_s3_bucket_object.request_approve.version_id
  handler           = "index.handler"
  layers            = [data.aws_lambda_layer_version.request_approve.arn]
  runtime           = "nodejs10.x"
  timeout           = 30
  role              = aws_iam_role.request_approve_role.arn

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

resource "aws_cloudwatch_log_group" "request_approve" {
  name              = "/aws/lambda/${aws_lambda_function.request_approve.function_name}"
  retention_in_days = 30
}

data "aws_lambda_layer_version" "request_approve" {
  layer_name = "request-approve-node-deps-${var.environment}"
}

data "aws_s3_bucket_object" "request_approve_layer" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "request-approve-layer.zip"
}

resource "aws_iam_role" "request_approve_role" {
  name = "request-approve-service-lambda-role-${var.environment}"

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
resource "aws_iam_role_policy" "request_approve_policy" {
  name = "request-approve-service-lambda-policy-${var.environment}"
  role = aws_iam_role.request_approve_role.id

  policy = data.aws_iam_policy_document.request_approve_policy.json
}

data "aws_iam_policy_document" "request_approve_policy" {
  version = "2012-10-17"

  statement {
    sid = "RequestApproveLambdaLoggingPolicy${title(var.environment)}"
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
    sid = "RequestApproveLambdaEc2AccessPolicy${title(var.environment)}"
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
    sid = "RequestApproveLambdaSNSPublishPolicy${title(var.environment)}"
    actions = [
      "SNS:Publish",
    ]
    resources = [
      aws_sns_topic.notifications.arn,
    ]
  }

  statement {
    sid = "RequestApproveLambdaDynamoDbPolicy${title(var.environment)}"
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

resource "aws_iam_role_policy_attachment" "rds_access_for_request_approve_lambda" {
  role       = aws_iam_role.request_approve_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

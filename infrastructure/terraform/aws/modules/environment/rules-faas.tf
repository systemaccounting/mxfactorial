# non vpc lambda to expedite client response
data "aws_s3_bucket_object" "rules_faas" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "rules-src.zip"
}

resource "aws_lambda_function" "rules_faas" {
  function_name     = "rules-faas-${var.environment}"
  description       = "rules service in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.rules_faas.bucket
  s3_key            = data.aws_s3_bucket_object.rules_faas.key
  s3_object_version = data.aws_s3_bucket_object.rules_faas.version_id
  handler           = "index.handler"
  runtime           = "nodejs10.x"
  timeout           = 30
  role              = aws_iam_role.rules_faas_role.arn

  environment {
    variables = {
      RULE_INSTANCES_TABLE_NAME = aws_dynamodb_table.rule_instances.name
    }
  }
}

resource "aws_cloudwatch_log_group" "rules_faas" {
  name              = "/aws/lambda/${aws_lambda_function.rules_faas.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "rules_faas_role" {
  name = "rules-faas-role-${var.environment}"

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
resource "aws_iam_role_policy" "rules_faas_policy" {
  name = "rules-faas-policy-${var.environment}"
  role = aws_iam_role.rules_faas_role.id

  policy = data.aws_iam_policy_document.rules_faas_policy.json
}

data "aws_iam_policy_document" "rules_faas_policy" {
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
    sid = "RulesLambdaDynamoDbPolicy${title(var.environment)}"
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

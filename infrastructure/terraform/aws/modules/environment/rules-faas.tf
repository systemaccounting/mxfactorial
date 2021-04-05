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
  runtime           = "nodejs14.x"
  timeout           = 30
  role              = aws_iam_role.rules_faas_role.arn

  environment {
    variables = merge(local.POSTGRES_VARS, {
      PG_MAX_CONNECTIONS = 20
      PG_IDLE_TIMEOUT    = 10000
      PG_CONN_TIMEOUT    = 500
    })
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
}

resource "aws_iam_role_policy_attachment" "rules_lambda_rds_access" {
  role       = aws_iam_role.rules_faas_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

locals {
  RULES = "rules"
}

data "aws_s3_object" "rules" {
  bucket = var.artifacts_bucket_name
  key    = "${local.RULES}-src.zip"
}

resource "aws_lambda_function" "rules" {
  function_name     = "${local.RULES}-${local.ID_ENV}"
  description       = "${local.RULES} service in ${local.SPACED_ID_ENV}"
  s3_bucket         = data.aws_s3_object.rules.bucket
  s3_key            = data.aws_s3_object.rules.key
  s3_object_version = data.aws_s3_object.rules.version_id
  handler           = "run-lambda.sh"
  runtime           = "nodejs18.x"
  timeout           = 30
  role              = aws_iam_role.rules.arn
  layers = [
    "arn:aws:lambda:${data.aws_region.current.name}:753240598075:layer:LambdaAdapterLayerX86:7"
  ]

  environment {
    variables = merge(local.POSTGRES_VARS, {
      PG_MAX_CONNECTIONS      = 20
      PG_IDLE_TIMEOUT         = 10000
      PG_CONN_TIMEOUT         = 500
      AWS_LAMBDA_EXEC_WRAPPER = "/opt/bootstrap"
      READINESS_CHECK_PATH    = var.readiness_check_path
    })
  }
}

resource "aws_lambda_function_url" "rules" {
  function_name      = aws_lambda_function.rules.function_name
  authorization_type = "AWS_IAM"
}

resource "aws_cloudwatch_log_group" "rules" {
  name              = "/aws/lambda/${aws_lambda_function.rules.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "rules" {
  name               = "${local.RULES}-role-${local.ID_ENV}"
  assume_role_policy = data.aws_iam_policy_document.rules_trust_policy.json
}

data "aws_iam_policy_document" "rules_trust_policy" {
  version = "2012-10-17"
  statement {
    sid    = "${replace(title(local.RULES), "-", "")}LambdaTrustPolicy${local.TITLED_ID_ENV}"
    effect = "Allow"
    actions = [
      "sts:AssumeRole",
    ]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "rules_policy" {
  name   = "${local.RULES}-policy-${local.ID_ENV}"
  role   = aws_iam_role.rules.id
  policy = data.aws_iam_policy_document.rules_policy.json
}

data "aws_iam_policy_document" "rules_policy" {
  version = "2012-10-17"

  statement {
    sid = "${replace(title(local.RULES), "-", "")}LambdaLoggingPolicy${local.TITLED_ID_ENV}"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["*"]
  }
}

resource "aws_lambda_permission" "rules" {
  // https://discuss.hashicorp.com/t/the-for-each-value-depends-on-resource-attributes-that-cannot-be-determined-until-apply/25016/2
  for_each = {
    one = aws_iam_role.graphql_role.arn
    two = module.request_create.lambda_role_arn
  }
  statement_id           = "AllowRulesUrlExecutionBy${replace(title(split("/", each.value)[1]), "-", "")}"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.rules.function_name
  principal              = each.value
  function_url_auth_type = "AWS_IAM"
}

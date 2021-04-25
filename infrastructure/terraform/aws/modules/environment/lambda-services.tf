// modules require ${service_name}-src.zip
// in mxfactorial-artifacts-{var.env} s3

module "request_create" {
  source       = "../go-lambda-service"
  service_name = "request-create"
  env          = var.environment
  env_vars = merge(local.POSTGRES_VARS, {
    RULE_LAMBDA_ARN = aws_lambda_function.rules.arn
  })
}

resource "aws_iam_policy" "request_create_lambda" {
  name        = "request-create-lambda-added-${var.environment}"
  description = "added perms for request-create lambda"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "LambdaInvoke"
        Action = [
          "lambda:InvokeFunction",
        ]
        Effect   = "Allow"
        Resource = aws_lambda_function.rules.arn
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "default" {
  role       = module.request_create.lambda_role_name
  policy_arn = aws_iam_policy.request_create_lambda.arn
}

##########################

module "request_approve" {
  source       = "../go-lambda-service"
  service_name = "request-approve"
  env          = var.environment
  env_vars     = merge(local.POSTGRES_VARS, {})
}

module "requests_by_account" {
  source       = "../go-lambda-service"
  service_name = "requests-by-account"
  env          = var.environment
  env_vars = merge(local.POSTGRES_VARS, {
    RETURN_RECORD_LIMIT = 20
  })
}

module "request_by_id" {
  source       = "../go-lambda-service"
  service_name = "request-by-id"
  env          = var.environment
  env_vars     = merge(local.POSTGRES_VARS, {})
}

module "transactions_by_account" {
  source       = "../go-lambda-service"
  service_name = "transactions-by-account"
  env          = var.environment
  env_vars = merge(local.POSTGRES_VARS, {
    RETURN_RECORD_LIMIT = 20
  })
}

module "transaction_by_id" {
  source       = "../go-lambda-service"
  service_name = "transaction-by-id"
  env          = var.environment
  env_vars     = merge(local.POSTGRES_VARS, {})
}

##########################

module "auto_confirm" {
  source       = "../go-lambda-service"
  service_name = "auto-confirm"
  env          = var.environment
  env_vars     = merge(local.POSTGRES_VARS, {})
}

resource "aws_lambda_permission" "auto_confirm" {
  statement_id  = "AllowExecutionFromCognito${title(var.environment)}"
  action        = "lambda:InvokeFunction"
  function_name = split(":", module.auto_confirm.lambda_arn)[6]
  principal     = "cognito-idp.amazonaws.com"
}

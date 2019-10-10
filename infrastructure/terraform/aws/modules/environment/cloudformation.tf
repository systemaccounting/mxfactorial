# integrates deploy lambda with cloudformation stack lambdas

data "aws_s3_bucket" "websocket_artifacts" {
  # provisioned from infrastructure/terraform/aws/environments/us-east-1/certs-and-s3.tf
  bucket = "mxfactorial-websocket-artifacts-${var.environment}"
}

resource "aws_lambda_permission" "allow_deploy_lambda_invoke_from_websocket_s3" {
  statement_id  = "AllowDeployLambdaInvokeFromWebsocketS3${var.environment}"
  action        = local.lambda_allowed_action
  function_name = aws_lambda_function.deploy_lambda.arn
  principal     = "s3.amazonaws.com"
  source_arn    = data.aws_s3_bucket.websocket_artifacts.arn
}

data "aws_iam_policy_document" "deploy_lambda_for_cloudformation_artifacts" {
  statement {
    sid = "CloudformationLambdaGetS3Object${var.environment}"

    effect = "Allow"

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${data.aws_s3_bucket.websocket_artifacts.arn}/*",
    ]
  }
}

resource "aws_iam_role_policy" "deploy_lambda_for_cloudformation_artifacts" {
  name   = "deploy-lambda-cloudformation-policy-${var.environment}"
  role   = aws_iam_role.deploy_lambda.id
  policy = data.aws_iam_policy_document.deploy_lambda_for_cloudformation_artifacts.json
}

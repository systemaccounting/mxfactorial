locals {
  PROJECT_CONF     = yamldecode(file("../../../../../project.yaml"))
  GITHUB_REPO_NAME = local.PROJECT_CONF[".github"].env_var.set.GITHUB_REPO_NAME.default
}

resource "aws_api_gateway_account" "apigw_logging" {
  cloudwatch_role_arn = aws_iam_role.apigw_logging.arn
}

resource "aws_iam_role" "apigw_logging" {
  name = "mxfactorial-apigw-logging"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "${title(local.GITHUB_REPO_NAME)}APIGwTrustPolicy"
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_policy" "apigw_logging" {
  name        = "${local.GITHUB_REPO_NAME}-apigw-logging"
  description = "${local.GITHUB_REPO_NAME} apigw logging permission"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "${title(local.GITHUB_REPO_NAME)}LoggingPolicy"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:FilterLogEvents",
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "apigw_logging" {
  role       = aws_iam_role.apigw_logging.name
  policy_arn = aws_iam_policy.apigw_logging.arn
}

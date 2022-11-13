locals {
  ID_ENV = "${var.env_id}-${var.env}"
}

resource "aws_api_gateway_account" "apigw_logging" {
  cloudwatch_role_arn = aws_iam_role.apigw_logging.arn
}

resource "aws_iam_role" "apigw_logging" {
  name = "${local.ID_ENV}-apigw-logging"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "APIGwTrustPolicy${var.env_id}${replace(title(var.region), "-", "")}"
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
  name        = "${local.ID_ENV}-apigw-logging"
  description = "apigw logging permission in ${var.env_id} ${var.region}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "LoggingPolicy${var.env_id}${replace(title(var.region), "-", "")}"
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

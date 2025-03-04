// account and role shared by apigwv2 module resources
// todo: move out to per account module
resource "aws_api_gateway_account" "default" {
  cloudwatch_role_arn = aws_iam_role.default.arn
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "default" {
  name               = "apigwv2-logging-${local.ID_ENV}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

data "aws_iam_policy_document" "default" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:PutLogEvents",
      "logs:GetLogEvents",
      "logs:FilterLogEvents",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "default" {
  name   = "apigwv2-logging-${local.ID_ENV}"
  role   = aws_iam_role.default.id
  policy = data.aws_iam_policy_document.default.json
}

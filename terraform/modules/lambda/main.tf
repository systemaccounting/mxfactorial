resource "aws_lambda_function" "mxfactorial_graphql_server" {
  filename      = "lambda.zip"
  function_name = "${var.graphql_lambda_function_name}"
  description   = "GraphQL server published on API Gateway"

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler = "index.handler"

  # cd ../../../graphql-faas/ && npm run zip && npm run cp:lambda
  source_code_hash = "${base64sha256(file("lambda.zip"))}"
  runtime          = "nodejs8.10"
  role             = "${aws_iam_role.mxfactorial_graphql_lambda_role.arn}"

  vpc_config {
    subnet_ids         = ["${data.aws_subnet_ids.default_for_lambda.ids}"]
    security_group_ids = ["${data.aws_security_group.default_for_lambda.id}"]
  }

  environment {
    variables = {
      REGION   = "${var.graphql_lambda_region_env_var}"
      HOST     = "${var.rds_endpoint}"
      USER     = "${var.db_master_username}"
      PASSWORD = "${var.db_master_password}"
    }
  }
}

resource "aws_iam_role" "mxfactorial_graphql_lambda_role" {
  name = "${var.graphql_lambda_role_name}"

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

# Policy for Lambda to create logs and dynamodb records
resource "aws_iam_role_policy" "mxfactorial_graphql_lambda_policy" {
  name = "${var.graphql_lambda_policy_name}"
  role = "${aws_iam_role.mxfactorial_graphql_lambda_role.id}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
          "dynamodb:*"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "rds_access_for_lambda" {
  role       = "${aws_iam_role.mxfactorial_graphql_lambda_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

data "aws_vpc" "default_for_lambda" {
  default = true
}

data "aws_security_group" "default_for_lambda" {
  vpc_id = "${data.aws_vpc.default_for_lambda.id}"
  name   = "default"
}

data "aws_subnet_ids" "default_for_lambda" {
  vpc_id = "${data.aws_vpc.default_for_lambda.id}"
}

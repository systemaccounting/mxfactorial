resource "aws_lambda_function" "transact_service_lambda" {
  filename      = "../../../transact-faas/transact-lambda.zip"
  function_name = "transact-lambda-${var.environment}"
  description   = "transact service in ${var.environment}"

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler = "index.handler"

  # cd ../../../graphql-faas/ && npm run zip && npm run cp:lambda
  source_code_hash = "${data.archive_file.transact_service_lambda_provisioner.output_base64sha256}"
  runtime          = "nodejs8.10"
  role             = "${aws_iam_role.transact_service_lambda_role.arn}"

  vpc_config {
    subnet_ids = ["${data.aws_subnet_ids.default.ids}"]

    security_group_ids = [
      "${aws_security_group.rds.id}",
      "${data.aws_security_group.default.id}",
    ]
  }

  environment {
    variables = {
      HOST             = "${aws_rds_cluster.default.endpoint}"
      USER             = "${var.db_master_username}"
      PASSWORD         = "${var.db_master_password}"
      RULES_LAMBDA_ARN = "${aws_lambda_function.rules_service_lambda.arn}"
    }
  }
}

resource "aws_iam_role" "transact_service_lambda_role" {
  name = "transact-service-lambda-role-${var.environment}"

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
resource "aws_iam_role_policy" "transact_service_lambda_policy" {
  name = "transact-service-lambda-policy-${var.environment}"
  role = "${aws_iam_role.transact_service_lambda_role.id}"

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
      "Action": "lambda:InvokeFunction",
      "Resource": [
        "${aws_lambda_function.rules_service_lambda.arn}"
      ]
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "rds_access_for_transact_lambda" {
  role       = "${aws_iam_role.transact_service_lambda_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

data "archive_file" "transact_service_lambda_provisioner" {
  type        = "zip"
  source_dir  = "../../../transact-faas"
  output_path = "../../../transact-faas/transact-lambda.zip"

  depends_on = ["null_resource.transact_service_lambda_provisioner"]
}

resource "null_resource" "transact_service_lambda_provisioner" {
  provisioner "local-exec" {
    working_dir = "../../../transact-faas"
    command     = "yarn install"
  }
}

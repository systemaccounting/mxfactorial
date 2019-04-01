resource "aws_lambda_function" "clone_tool_lambda" {
  filename = "../../../schema/clone-faas/clone-src.zip"

  # filename      = "${data.archive_file.clone_tool_lambda_provisioner.output_path}"
  function_name = "clone-tool-lambda-${var.environment}"
  description   = "clone tool in ${var.environment}"

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler = "index.handler"

  source_code_hash = "${base64sha256(file("../../../schema/clone-faas/clone-src.zip"))}"

  # https://github.com/gkrizek/bash-lambda-layer
  layers = ["arn:aws:lambda:${data.aws_region.current.name}:744348701589:layer:bash:5"]

  # source_code_hash = "${data.archive_file.clone_tool_lambda_provisioner.output_base64sha256}"
  runtime = "nodejs8.10"
  role    = "${aws_iam_role.clone_tool_lambda.arn}"

  environment {
    variables = {
      # workaround for aws_api_gateway_deployment.transact.invoke_url cycle error:
      # SCHEMA_UPDATE_URL        = "https://${aws_api_gateway_rest_api.schema_update_tool_lambda.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
      SCHEMA_UPDATE_LAMBDA_ARN = "${aws_lambda_function.schema_update_tool_lambda.arn}"
    }
  }

  timeout = 30
}

resource "aws_iam_role" "clone_tool_lambda" {
  name = "clone-tool-lambda-role-${var.environment}"

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
resource "aws_iam_role_policy" "clone_tool_lambda_policy" {
  name = "clone-tool-lambda-policy-${var.environment}"
  role = "${aws_iam_role.clone_tool_lambda.id}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": [
        "${aws_lambda_function.schema_update_tool_lambda.arn}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

# resource "null_resource" "clone_tool_lambda_provisioner" {
#   provisioner "local-exec" {
#     working_dir = "../../../services/rules-faas"
#     command     = "yarn install"
#   }
# }


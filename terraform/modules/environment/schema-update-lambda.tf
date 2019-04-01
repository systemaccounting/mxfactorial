resource "aws_lambda_function" "schema_update_tool_lambda" {
  filename = "../../../schema/update-faas/schema-update-src.zip"

  # filename      = "${data.archive_file.schema_update_tool_lambda_provisioner.output_path}"
  function_name = "schema-update-tool-lambda-${var.environment}"
  description   = "transact service in ${var.environment}"

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler = "index.handler"

  source_code_hash = "${base64sha256(file("../../../schema/update-faas/schema-update-src.zip"))}"

  # source_code_hash = "${data.archive_file.schema_update_tool_lambda_provisioner.output_base64sha256}"
  runtime = "nodejs8.10"
  role    = "${aws_iam_role.schema_update_tool_lambda_role.arn}"

  layers = [
    "${aws_lambda_layer_version.schema_update_layer.arn}",

    # https://github.com/gkrizek/bash-lambda-layer
    "arn:aws:lambda:${data.aws_region.current.name}:744348701589:layer:bash:5",
  ]

  vpc_config {
    subnet_ids = ["${data.aws_subnet_ids.default.ids}"]

    security_group_ids = [
      "${aws_security_group.rds.id}",
      "${data.aws_security_group.default.id}",
    ]
  }

  environment {
    variables = {
      HOST     = "${aws_rds_cluster.default.endpoint}"
      USER     = "${var.db_master_username}"
      PASSWORD = "${var.db_master_password}"
    }
  }

  timeout = 30
}

resource "aws_lambda_layer_version" "schema_update_layer" {
  filename   = "../../../schema/update-faas/schema-update-layer.zip"
  layer_name = "schema-update-node-deps-${var.environment}"

  compatible_runtimes = ["nodejs8.10"]
  source_code_hash    = "${base64sha256(file("../../../schema/update-faas/schema-update-layer.zip"))}"
}

resource "aws_iam_role" "schema_update_tool_lambda_role" {
  name = "schema-update-tool-lambda-role-${var.environment}"

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

# policy for lambda to create logs and access rds
resource "aws_iam_role_policy" "schema_update_tool_lambda_policy" {
  name = "schema-update-tool-lambda-policy-${var.environment}"
  role = "${aws_iam_role.schema_update_tool_lambda_role.id}"

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
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "rds_access_for_schema_update_tool_lambda" {
  role       = "${aws_iam_role.schema_update_tool_lambda_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

# data "archive_file" "schema_update_tool_lambda_provisioner" {
#   type        = "zip"
#   source_dir  = "../../../services/transact-faas"
#   output_path = "../../../services/transact-faas/transact-lambda.zip"


#   depends_on = ["null_resource.schema_update_tool_lambda_provisioner"]
# }


# resource "null_resource" "schema_update_tool_lambda_provisioner" {
#   provisioner "local-exec" {
#     working_dir = "../../../services/transact-faas"
#     command     = "yarn install"
#   }
# }


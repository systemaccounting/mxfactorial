resource "aws_lambda_function" "transact_service_lambda" {
  filename = "../../../../services/transact-faas/transact-lambda.zip"

  # filename      = data.archive_file.transact_service_lambda_provisioner.output_path
  function_name = "transact-lambda-${var.environment}"
  description   = "transact service in ${var.environment}"

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler = "index.handler"

  source_code_hash = filesha256("../../../../services/transact-faas/transact-lambda.zip")
  layers           = [aws_lambda_layer_version.transact_layer.arn]

  # source_code_hash = data.archive_file.transact_service_lambda_provisioner.output_base64sha256
  runtime = "nodejs8.10"
  timeout = 30
  role    = aws_iam_role.transact_service_lambda_role.arn

  vpc_config {
    subnet_ids = data.aws_subnet_ids.default.ids

    security_group_ids = [
      aws_security_group.rds.id,
      data.aws_security_group.default.id,
      data.aws_security_group.vpce_api.id,
    ]
  }

  environment {
    variables = {
      HOST     = aws_rds_cluster.default.endpoint
      USER     = var.db_master_username
      PASSWORD = var.db_master_password

      # workaround for aws_api_gateway_deployment.rules.invoke_url cycle error:
      RULES_URL = "https://${aws_api_gateway_rest_api.rules.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
    }
  }
}

resource "aws_lambda_layer_version" "transact_layer" {
  filename   = "../../../../services/transact-faas/transact-layer.zip"
  layer_name = "transact-node-deps-${var.environment}"

  compatible_runtimes = ["nodejs8.10", "nodejs6.10"]
  source_code_hash    = filesha256("../../../../services/transact-faas/transact-layer.zip")
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

# policy for lambda to create logs and access rds
resource "aws_iam_role_policy" "transact_service_lambda_policy" {
  name = "transact-service-lambda-policy-${var.environment}"
  role = aws_iam_role.transact_service_lambda_role.id

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

resource "aws_iam_role_policy_attachment" "rds_access_for_transact_lambda" {
  role       = aws_iam_role.transact_service_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

# data "archive_file" "transact_service_lambda_provisioner" {
#   type        = "zip"
#   source_dir  = "../../../services/transact-faas"
#   output_path = "../../../services/transact-faas/transact-lambda.zip"


#   depends_on = ["null_resource.transact_service_lambda_provisioner"]
# }


# resource "null_resource" "transact_service_lambda_provisioner" {
#   provisioner "local-exec" {
#     working_dir = "../../../services/transact-faas"
#     command     = "yarn install"
#   }
# }


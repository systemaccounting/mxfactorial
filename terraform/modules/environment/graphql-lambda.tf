resource "aws_lambda_function" "mxfactorial_graphql_server" {
  filename = "../../../services/graphql-faas/graphql-src.zip"

  # filename      = "${data.archive_file.mxfactorial_graphql_server_provisioner.output_path}"
  function_name = "mxfactorial-graphql-server-${var.environment}"
  description   = "GraphQL server published on API Gateway"

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler = "index.handler"

  source_code_hash = "${base64sha256(file("../../../services/graphql-faas/graphql-src.zip"))}"
  layers           = ["${aws_lambda_layer_version.graphql_layer.arn}"]

  # source_code_hash = "${data.archive_file.mxfactorial_graphql_server_provisioner.output_base64sha256}"
  runtime = "nodejs8.10"
  role    = "${aws_iam_role.mxfactorial_graphql_lambda_role.arn}"

  environment {
    variables = {
      HOST                = "${aws_rds_cluster.default.endpoint}"
      USER                = "${var.db_master_username}"
      PASSWORD            = "${var.db_master_password}"
      RULES_LAMBDA_ARN    = "${aws_lambda_function.rules_service_lambda.arn}"
      TRANSACT_LAMBDA_ARN = "${aws_lambda_function.transact_service_lambda.arn}"
      MEASURE_LAMBDA_ARN  = "${aws_lambda_function.measure_service_lambda.arn}"
    }
  }
}

resource "aws_lambda_layer_version" "graphql_layer" {
  filename   = "../../../services/graphql-faas/graphql-layer.zip"
  layer_name = "graphql-node-deps-${var.environment}"

  compatible_runtimes = ["nodejs8.10", "nodejs6.10"]
  source_code_hash    = "${base64sha256(file("../../../services/graphql-faas/graphql-layer.zip"))}"
}

resource "aws_iam_role" "mxfactorial_graphql_lambda_role" {
  name = "mxfactorial-graphql-lambda-${var.environment}"

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

resource "aws_iam_role_policy" "mxfactorial_graphql_lambda_policy" {
  name = "mxfactorial-graphql-lambda-${var.environment}"
  role = "${aws_iam_role.mxfactorial_graphql_lambda_role.id}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": [
        "${aws_lambda_function.rules_service_lambda.arn}",
        "${aws_lambda_function.transact_service_lambda.arn}",
        "${aws_lambda_function.measure_service_lambda.arn}"
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

resource "aws_iam_role_policy_attachment" "rds_access_for_lambda" {
  role       = "${aws_iam_role.mxfactorial_graphql_lambda_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

# data "archive_file" "mxfactorial_graphql_server_provisioner" {
#   type        = "zip"
#   source_dir  = "../../../services/graphql-faas"
#   output_path = "../../../services/graphql-faas/graphql-lambda.zip"


#   depends_on = ["null_resource.mxfactorial_graphql_server_provisioner"]
# }


# resource "null_resource" "mxfactorial_graphql_server_provisioner" {
#   provisioner "local-exec" {
#     working_dir = "../../../services/graphql-faas"
#     command     = "yarn install"
#   }
# }


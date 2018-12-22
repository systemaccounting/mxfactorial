resource "aws_api_gateway_rest_api" "mxfactorial_api" {
  name        = "mxfactorial-api-${terraform.workspace}"
  description = "GraphQL Endpoint"
}

resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = "${aws_api_gateway_rest_api.mxfactorial_api.id}"
  parent_id   = "${aws_api_gateway_rest_api.mxfactorial_api.root_resource_id}"
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = "${aws_api_gateway_rest_api.mxfactorial_api.id}"
  resource_id   = "${aws_api_gateway_resource.proxy.id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = "${aws_api_gateway_rest_api.mxfactorial_api.id}"
  resource_id = "${aws_api_gateway_method.proxy.resource_id}"
  http_method = "${aws_api_gateway_method.proxy.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.mxfactorial_graphql_server.invoke_arn}"
}

resource "aws_api_gateway_method" "proxy_root" {
  rest_api_id   = "${aws_api_gateway_rest_api.mxfactorial_api.id}"
  resource_id   = "${aws_api_gateway_rest_api.mxfactorial_api.root_resource_id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_root" {
  rest_api_id = "${aws_api_gateway_rest_api.mxfactorial_api.id}"
  resource_id = "${aws_api_gateway_method.proxy_root.resource_id}"
  http_method = "${aws_api_gateway_method.proxy_root.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.mxfactorial_graphql_server.invoke_arn}"
}

resource "aws_api_gateway_deployment" "environment" {
  depends_on = [
    "aws_api_gateway_integration.lambda",
    "aws_api_gateway_integration.lambda_root",
  ]

  rest_api_id = "${aws_api_gateway_rest_api.mxfactorial_api.id}"
  stage_name  = "${terraform.workspace}"
}

resource "aws_lambda_permission" "mxfactorial_api_to_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.mxfactorial_graphql_server.function_name}"
  principal     = "apigateway.amazonaws.com"

  # The /*/* portion grants access from any method on any resource
  # within the API Gateway "REST API".
  source_arn = "${aws_api_gateway_deployment.environment.execution_arn}/*/*"
}

resource "aws_api_gateway_account" "mxfactorial_api_account" {
  cloudwatch_role_arn = "${aws_iam_role.cloudwatch.arn}"
}

resource "aws_iam_role" "cloudwatch" {
  name = "mxfactorial-cloudwatch-role-${terraform.workspace}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "apigateway.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "cloudwatch" {
  name = "mxfactorial-cloudwatch-policy-${terraform.workspace}"
  role = "${aws_iam_role.cloudwatch.id}"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams",
                "logs:PutLogEvents",
                "logs:GetLogEvents",
                "logs:FilterLogEvents"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}

resource "aws_api_gateway_domain_name" "mxfactorial" {
  domain_name = "${"${terraform.workspace}" == "prod" ?  "api.mxfactorial.io" : "${terraform.workspace}-api.mxfactorial.io"}"

  certificate_arn = "${lookup("${null_resource.api_cert_arns.triggers}", "${terraform.workspace}")}"
}

resource "aws_api_gateway_base_path_mapping" "mxfactorial" {
  api_id      = "${aws_api_gateway_rest_api.mxfactorial_api.id}"
  stage_name  = "${aws_api_gateway_deployment.environment.stage_name}"
  domain_name = "${aws_api_gateway_domain_name.mxfactorial.domain_name}"
}

module "apigateway-cors" {
  source  = "mewa/apigateway-cors/aws"
  version = "1.0.0"

  # insert the 3 required variables here
  api = "${aws_api_gateway_rest_api.mxfactorial_api.id}"
  resource = "${aws_api_gateway_resource.proxy.id}"
  methods = ["POST"]
}

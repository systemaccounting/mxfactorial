resource "aws_lambda_function" "mxfactorial_graphql_server" {
  filename      = "lambda.zip"
  function_name = "MxfactorialGraphQLServer"

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler = "index.handler"

  # cd ../../../graphql-faas/ && npm run zip && npm run cp:lambda
  source_code_hash = "${base64sha256(file("lambda.zip"))}"
  runtime          = "nodejs8.10"
  role             = "${aws_iam_role.mxfactorial_graphql_lambda_role.arn}"
}

resource "aws_iam_role" "mxfactorial_graphql_lambda_role" {
  name = "mxfactorial_graphql_lambda_${lookup(var.region, "${terraform.workspace}")}"

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
  name = "mxfactorial_lambda"
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
          "logs:PutLogEvents"
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

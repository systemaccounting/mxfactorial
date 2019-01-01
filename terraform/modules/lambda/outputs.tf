output "graphql_lambda_function_name" {
  value = "${aws_lambda_function.mxfactorial_graphql_server.function_name}"
}

output "graphql_lambda_function_arn" {
  value = "${aws_lambda_function.mxfactorial_graphql_server.invoke_arn}"
}

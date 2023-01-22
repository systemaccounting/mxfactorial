output "lambda_arn" {
  value = aws_lambda_function.default.arn
}

output "lambda_invoke_arn" {
  value = aws_lambda_function.default.invoke_arn
}

output "lambda_function_url" {
  value = aws_lambda_function_url.default.function_url
}

output "lambda_role_arn" {
  value = aws_iam_role.default.arn
}

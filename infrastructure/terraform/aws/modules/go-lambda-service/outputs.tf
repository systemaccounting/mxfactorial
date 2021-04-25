output "lambda_arn" {
  value = aws_lambda_function.default.arn
}

output "lambda_role_name" {
  value = aws_iam_role.default.name
}

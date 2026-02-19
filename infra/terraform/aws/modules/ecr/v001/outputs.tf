output "ecr_repository_url" {
  value = aws_ecr_repository.default.repository_url
}

output "ecr_repository_arn" {
  value = aws_ecr_repository.default.arn
}

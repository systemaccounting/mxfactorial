output "ecr_repository_url" {
  value = aws_ecr_repository.default.repository_url
}

output "codebuild_project_name" {
  value = module.codebuild.project_name
}

output "codebuild_project_arn" {
  value = module.codebuild.project_arn
}

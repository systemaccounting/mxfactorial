output "project_name" {
  value = aws_codebuild_project.default.name
}

output "project_arn" {
  value = aws_codebuild_project.default.arn
}

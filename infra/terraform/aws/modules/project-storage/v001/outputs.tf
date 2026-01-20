output "artifacts_bucket_name" {
  value = aws_s3_bucket.artifacts.bucket
}

output "artifacts_bucket_arn" {
  value = aws_s3_bucket.artifacts.arn
}

output "codebuild_project_names" {
  value = { for k, v in module.ecr_repos : k => v.codebuild_project_name }
}

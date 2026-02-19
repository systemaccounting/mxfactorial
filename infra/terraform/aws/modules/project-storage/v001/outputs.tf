output "artifacts_bucket_name" {
  value = aws_s3_bucket.artifacts.bucket
}

output "artifacts_bucket_arn" {
  value = aws_s3_bucket.artifacts.arn
}

output "ecr_repo_names" {
  value = local.ECR_REPOS
}

output "ecr_repo_arns" {
  value = { for k, v in module.ecr_repos : k => v.ecr_repository_arn }
}

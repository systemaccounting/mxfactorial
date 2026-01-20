variable "env" {}
variable "env_id" {}
variable "artifacts_bucket_name" {}
variable "artifacts_bucket_arn" {}
variable "codebuild_project_names" {
  type = map(string)
}

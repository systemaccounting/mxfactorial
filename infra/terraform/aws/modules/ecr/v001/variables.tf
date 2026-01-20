variable "env" {}
variable "env_id" {}
variable "force_delete" {
	type    = bool
	default = false
}
variable "service_name" {}
variable "max_image_storage_count" {}
variable "artifacts_bucket_arn" {}
variable "aws_region" {}
variable "aws_account_id" {}
variable "codebuild_compute_type" {}
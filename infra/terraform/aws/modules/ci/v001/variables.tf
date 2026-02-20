variable "env" {}
variable "env_id" {}
variable "service_names" {
  type = set(string)
}
variable "artifacts_bucket_name" {}
variable "artifacts_bucket_arn" {}
variable "compute_type" {}

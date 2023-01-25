variable "service_name" {}
variable "env" {}
variable "env_vars" {
  type    = map(any)
  default = null
}
variable "invoke_url_principals" {
  type    = list(string)
  default = []
}
variable "invoke_arn_principals" {
  type    = list(string)
  default = []
}
variable "attached_policy_arns" {
  type        = list(string)
  default     = []
  description = "example: aws_iam_policy.apiv2_ddb.arn"
}
variable "create_secret" {
  type        = bool
  default     = false
  description = "adds lambda arn in secrets manager for local testing"
}
variable "artifacts_bucket_name" {}
variable "ssm_prefix" {}
variable "env_id" {}
variable "web_adapter_layer_version" {}
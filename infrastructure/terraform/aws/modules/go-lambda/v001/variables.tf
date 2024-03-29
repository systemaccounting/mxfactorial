variable "service_name" {}
variable "env" {}
variable "env_vars" {
  type    = map(any)
  default = null
}
variable "invoke_arn_principals" {
  type        = list(string)
  default     = []
  description = "example: cognito-idp.amazonaws.com"
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

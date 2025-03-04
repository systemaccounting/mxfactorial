variable "api_name" {}
variable "env" {}
variable "lambda_invoke_arn" {}
variable "api_version" {}
variable "enable_api_auto_deploy" {}
variable "payload_format_version" {}
variable "enable_api_auth" {}
variable "cognito_endpoint" {}
variable "cognito_client_id" {}
variable "authorization_header_key" {}
# variable "apigwv2_logging_level" {
#   validation {
#     condition     = can(regex("^(OFF|INFO|ERROR)$", var.apigwv2_logging_level))
#     error_message = "apigwv2_logging_level must be one of OFF, INFO, ERROR"
#   }
# }
variable "apigwv2_burst_limit" {}
variable "apigwv2_rate_limit" {}

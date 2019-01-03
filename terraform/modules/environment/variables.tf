variable "environment" {
  type = "string"
}

variable "react_bucket_name" {
  type = "string"
}

variable "client_fqdn" {
  type = "string"
}

variable "api_fqdn" {
  type = "string"
}

variable "db_cluster_identifier" {
  type = "string"
}

variable "db_master_username" {
  type = "string"
}

variable "db_master_password" {
  type = "string"
}

variable "cloud9_name" {
  type = "string"
}

variable "graphql_lambda_function_name" {
  type = "string"
}

variable "graphql_lambda_region_env_var" {
  type = "string"
}

variable "graphql_lambda_role_name" {
  type = "string"
}

variable "graphql_lambda_policy_name" {
  type = "string"
}

variable "faker_lambda_region_env_var" {
  type = "string"
}

variable "domain_aliases" {
  type = "list"
}

variable "ssl_arn" {
  type = "string"
}

variable "batch_ecs_instance_role_name" {
  type = "string"
}

variable "batch_aws_iam_instance_profile_name" {
  type = "string"
}

variable "aws_batch_service_role_name" {
  type = "string"
}

variable "aws_batch_compute_environment_name" {
  type = "string"
}

variable "aws_batch_job_queue_name" {
  type = "string"
}

variable "aws_batch_job_definition_name" {
  type = "string"
}

variable "liquibase_job_definition_role_name" {
  type = "string"
}

variable "certificate_arn" {
  description = "Certificate ARN"
}

variable "stage_name" {
  description = "API gateway stage name"
}

variable "api_name" {
  description = "GraphQL enpoint name"
}

variable "domain_name" {
  description = "API Gateway domain name"
}

variable "iam_role_name" {
  description = "IAM role name"
}

variable "iam_role_policy_name" {
  description = "IAM role policy name"
}

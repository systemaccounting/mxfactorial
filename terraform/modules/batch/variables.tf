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
  type    = "string"
  default = "liquibase"
}

variable "aws_batch_job_definition_name" {
  type    = "string"
  default = "liquibase"
}

variable "liquibase_job_definition_role_name" {
  type = "string"
}

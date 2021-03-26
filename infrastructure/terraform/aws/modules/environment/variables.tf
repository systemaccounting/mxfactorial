variable "environment" {
  type = string
}

variable "ssl_arn" {
  type = string
}

variable "certificate_arn" {
  type        = string
  description = "Certificate ARN"
}

variable "db_snapshot_id" {
  type = string
}

variable "req_query_return_limit" {
  type = number
}

variable "trans_query_return_limit" {
  type = number
}

variable "rds_db_version" {}

variable "rds_allow_major_version_upgrade" {
  type = bool
}

variable "rds_instance_class" {}

variable "rds_parameter_group" {}

variable "rds_instance_name" {}

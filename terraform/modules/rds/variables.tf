variable "environment" {
  type = "string"
}

variable "master_username" {
  type = "string"
}

variable "master_password" {
  type = "string"
}

variable "backup_retention_period" {
  type    = "string"
  default = 1
}

variable "vpc_security_group_ids" {
  type = "list"
}

variable "environment" {
  type = string
}

variable "db_master_username" {
  type = string
}

variable "db_master_password" {
  type = string
}

variable "ssl_arn" {
  type = string
}

variable "certificate_arn" {
  type = string
  description = "Certificate ARN"
}

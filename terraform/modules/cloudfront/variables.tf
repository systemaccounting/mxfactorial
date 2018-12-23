variable "comment" {
  type = "string"
}

variable "aliases" {
  type = "list"
}

variable "cloudfront_target_origin_id" {
  type = "string"
}

variable "acm_certificate_arn" {
  type = "string"
}

variable "domain_name" {
  type = "string"
}

variable "origin_id" {
  type = "string"
}

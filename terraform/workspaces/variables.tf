variable "region" {
  type = "map"

  default = {
    default = "us-east-1"
    dev     = "us-east-2"
  }
}

variable "environment" {
  type = "map"

  default = {
    default = "prod"
    dev     = "dev"
  }
}

variable "alias_prefix" {
  type = "map"

  default = {
    default = ""
    dev     = "dev."
  }
}

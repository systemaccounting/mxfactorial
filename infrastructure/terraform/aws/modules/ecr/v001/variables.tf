variable "env" {}
variable "env_id" {}
variable "force_destroy_storage" {
	type = bool
	default = false
}
variable "service_name" {}
variable "max_image_storage_count" {}
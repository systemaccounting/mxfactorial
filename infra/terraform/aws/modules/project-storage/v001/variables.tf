variable "env" {}
variable "env_id" {}
variable "artifacts_bucket_name_prefix" {}
variable "tfstate_bucket_name_prefix" {}
variable "ddb_table_name_prefix" {}
variable "ddb_table_hash_key" {}
variable "force_destroy_storage" {
	type = bool
	default = false
}
variable "max_image_storage_count" {}
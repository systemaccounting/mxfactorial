module "rds" {
  source = "../modules/rds"

  db_cluster_identifier = "mxfactorial-${terraform.workspace}"
  db_master_username    = "${var.db_master_username}"
  db_master_password    = "${var.db_master_password}"
  cloud9_name           = "rds-connect-${terraform.workspace}"
}

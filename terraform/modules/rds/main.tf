resource "aws_rds_cluster" "default" {
  cluster_identifier      = "${var.db_cluster_identifier}"
  engine                  = "aurora"
  engine_mode             = "serverless"
  engine_version          = "5.6.10a"
  database_name           = "mxfactorial"
  master_username         = "${var.db_master_username}"
  master_password         = "${var.db_master_password}"
  port                    = "3306"
  backup_retention_period = 1
  preferred_backup_window = "08:00-10:00"
  skip_final_snapshot     = true
  apply_immediately       = true

  vpc_security_group_ids = ["${data.aws_security_groups.default.ids}"]

  scaling_configuration {
    auto_pause               = true
    max_capacity             = 256
    min_capacity             = 2
    seconds_until_auto_pause = 300
  }
}

data "aws_vpc" "default" {
  default = true
}

data "aws_security_groups" "default" {
  filter {
    name   = "vpc-id"
    values = ["${data.aws_vpc.default.id}"]
  }
}

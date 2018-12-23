resource "aws_rds_cluster" "default" {
  cluster_identifier      = "mxfactorial-${var.environment}"
  engine                  = "aurora"
  engine_mode             = "serverless"
  engine_version          = "5.6.10a"
  database_name           = "mxfactorial"
  master_username         = "${var.master_username}"
  master_password         = "${var.master_password}"
  port                    = "3306"
  backup_retention_period = "${var.backup_retention_period}"
  preferred_backup_window = "08:00-10:00"
  skip_final_snapshot     = true
  apply_immediately       = true

  vpc_security_group_ids = ["${var.vpc_security_group_ids}"]

  # vpc_security_group_ids = ["${data.aws_security_groups.default.ids}"]

  scaling_configuration {
    auto_pause               = true
    max_capacity             = 256
    min_capacity             = 2
    seconds_until_auto_pause = 300
  }
}

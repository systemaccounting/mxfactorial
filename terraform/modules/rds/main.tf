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
    name   = "group-name"
    values = ["default"]
  }
}

resource "aws_cloud9_environment_ec2" "default" {
  instance_type               = "t2.micro"
  name                        = "${var.cloud9_name}"
  description                 = "connecting to rds"
  automatic_stop_time_minutes = 15
  subnet_id                   = "${data.aws_subnet_ids.default.ids[0]}"
}

data "aws_subnet_ids" "default" {
  vpc_id = "${data.aws_vpc.default.id}"
}

data "aws_security_groups" "cloud9" {
  filter {
    name   = "group-name"
    values = ["aws-cloud9-*"]
  }
}

resource "aws_security_group_rule" "allow_cloud9" {
  count                    = "${length(data.aws_security_groups.cloud9.ids)}"
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  source_security_group_id = "${element(data.aws_security_groups.cloud9.ids, count.index)}"
  security_group_id        = "${data.aws_security_groups.default.ids[0]}"
}

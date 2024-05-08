resource "aws_db_instance" "postgres" {
  count                               = var.build_db ? 1 : 0 // false during terraform development
  identifier                          = var.rds_instance_name
  snapshot_identifier                 = var.db_snapshot_id
  allocated_storage                   = 20
  storage_type                        = "gp2"
  engine                              = "postgres"
  engine_version                      = var.rds_engine_version
  instance_class                      = var.rds_instance_class
  db_name                             = "mxfactorial"
  username                            = "u${random_password.pguser.result}"
  password                            = random_password.pgpassword.result
  port                                = 5432
  parameter_group_name                = var.rds_parameter_group
  backup_retention_period             = 0
  backup_window                       = "07:09-07:39"
  db_subnet_group_name                = aws_db_subnet_group.default.name
  deletion_protection                 = false
  enabled_cloudwatch_logs_exports     = ["postgresql", "upgrade"]
  iam_database_authentication_enabled = true
  skip_final_snapshot                 = true
  vpc_security_group_ids              = [aws_security_group.postgres.id]
  publicly_accessible                 = true
  allow_major_version_upgrade         = var.rds_allow_major_version_upgrade
}

resource "random_password" "pguser" {
  length  = 8
  special = false
}

resource "random_password" "pgpassword" {
  length  = 8
  special = false
}

locals {
  POSTGRES_VARS = {
    PGDATABASE = var.build_db ? aws_db_instance.postgres[0].db_name : ""
    PGHOST     = var.build_db ? aws_db_instance.postgres[0].address : ""
    PGPASSWORD = var.build_db ? aws_db_instance.postgres[0].password : ""
    PGPORT     = var.build_db ? aws_db_instance.postgres[0].port : ""
    PGUSER     = var.build_db ? aws_db_instance.postgres[0].username : ""
  }
}

########## Create security group for RDS ##########
resource "aws_security_group" "postgres" {
  name        = "db-sec-grp-${local.ID_ENV}"
  description = "internal postgres access"
  vpc_id      = data.aws_vpc.default.id
}

# todo: add to vpc after activity requires constantly running services
###### temporarily allow public ingress during development ######
###### to avoid vpc lambda cold starts ######
resource "aws_security_group_rule" "allow_postgres_access" {
  type              = "ingress"
  from_port         = 5432
  to_port           = 5432
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.postgres.id
}

########## allow traffic on 5432 between cloud9 and postgres ##########
# resource "aws_security_group_rule" "allow_cloud9_postgres" {
#   type              = "ingress"
#   from_port         = 5432
#   to_port           = 5432
#   protocol          = "tcp"
#   cidr_blocks       = data.aws_subnet.rds_cloud9.*.cidr_block
#   security_group_id = aws_security_group.postgres.id
# }


########## Create clou9 instance to access RDS ##########
# resource "aws_cloud9_environment_ec2" "default" {
#   instance_type               = "t2.micro"
#   name                        = "rds-connect-${var.env}"
#   description                 = "connecting to rds"
#   automatic_stop_time_minutes = 15
#   # assign ANY 1 subnet assigned in aws_db_subnet_group.default.subnet_ids, e.g. 0
#   subnet_id = tolist(data.aws_subnets.default.ids)[0]
# }


###### Allow all traffic within RDS and lambda group ######
resource "aws_security_group_rule" "allow_all_internal_inbound_rds" {
  type              = "ingress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  self              = true
  security_group_id = aws_security_group.postgres.id
}

###### Allow all outbound within RDS and lambda group for messaging topics and queues ######
resource "aws_security_group_rule" "allow_all_outbound_rds" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  self              = true
  security_group_id = aws_security_group.postgres.id
}

###### Cherry-pick subnets for RDS in future ######
resource "aws_db_subnet_group" "default" {
  description = "postgres db subnet group in ${local.SPACED_ID_ENV}"
  name        = "db-subnet-group-${local.ID_ENV}"
  subnet_ids  = data.aws_subnets.default.ids
}

###### Reference CIDR blocks instead of security groups ######
###### since cloud9 creates its own security group ######
# data "aws_subnet" "rds_cloud9" {
#   count = length(data.aws_subnets.default.ids)
#   # id    = data.aws_subnets.default[count.index].ids
#   id = tolist(data.aws_subnets.default.ids)[count.index]
# }

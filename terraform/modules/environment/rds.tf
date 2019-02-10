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
  db_subnet_group_name    = "${aws_db_subnet_group.default.name}"

  vpc_security_group_ids = ["${aws_security_group.rds.id}"]

  scaling_configuration {
    auto_pause               = true
    max_capacity             = 256
    min_capacity             = 2
    seconds_until_auto_pause = 300
  }
}

########## Create clou9 instance to access RDS ##########
resource "aws_cloud9_environment_ec2" "default" {
  instance_type               = "t2.micro"
  name                        = "${var.cloud9_name}"
  description                 = "connecting to rds"
  automatic_stop_time_minutes = 15
  subnet_id                   = "${aws_db_subnet_group.default.subnet_ids[0]}"
}

########## Create security group for RDS ##########
resource "aws_security_group" "rds" {
  name        = "db-security-group-${var.environment}"
  description = "Allow internal MySQL 3306 port access"
  vpc_id      = "${data.aws_vpc.default.id}"
}

########## Allow traffic on port 3306 between cloud9 and RDS security groups ##########
resource "aws_security_group_rule" "allow_cloud9" {
  type              = "ingress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  cidr_blocks       = ["${data.aws_subnet.rds_cloud9.*.cidr_block}"]
  security_group_id = "${aws_security_group.rds.id}"
}

###### Allow all traffic on 3306 port within subnet shared by RDS and cloud9 ######
resource "aws_security_group_rule" "allow_all_internal" {
  type              = "ingress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  self              = true
  security_group_id = "${aws_security_group.rds.id}"
}

###### Cherry-pick subnets for RDS in future ######
resource "aws_db_subnet_group" "default" {
  description = "serverless db subnet group"
  name        = "db-subnet-group-${var.environment}"
  subnet_ids  = ["${data.aws_subnet_ids.default.ids}"]

  tags = {
    Name = "serverless-db-subnet-group"
  }
}

###### Reference CIDR blocks instead of security groups ######
###### since cloud9 creates its own security group ######
data "aws_subnet" "rds_cloud9" {
  count = "${length(data.aws_subnet_ids.default.ids)}"
  id    = "${data.aws_subnet_ids.default.ids[count.index]}"
}

###### Integration test data teardown lambda ######
resource "aws_lambda_function" "integration_test_data_teardown_lambda" {
  filename      = "../common-bin/graphql/teardown/teardown-lambda.zip"
  function_name = "${var.integration_test_data_teardown_lambda_name}"
  description   = "Integration test data teardown lambda"

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler = "index.handler"

  # cd ../../../graphql-faas/ && npm run zip && npm run cp:lambda
  # source_code_hash = "${base64sha256(file("../common-bin/graphql/teardown/teardown-lambda.zip"))}"
  source_code_hash = "${data.archive_file.integration_test_data_teardown_lambda_provisioner.output_base64sha256}"

  runtime = "nodejs8.10"

  # imported from lambda.tf
  role = "${aws_iam_role.mxfactorial_graphql_lambda_role.arn}"

  vpc_config {
    subnet_ids = ["${data.aws_subnet_ids.default.ids}"]

    security_group_ids = [
      "${aws_security_group.rds.id}",
      "${data.aws_security_group.default.id}",
    ]
  }

  environment {
    variables = {
      REGION   = "${var.graphql_lambda_region_env_var}"
      HOST     = "${aws_rds_cluster.default.endpoint}"
      USER     = "${var.db_master_username}"
      PASSWORD = "${var.db_master_password}"
    }
  }
}

data "archive_file" "integration_test_data_teardown_lambda_provisioner" {
  type        = "zip"
  source_dir  = "../common-bin/graphql/teardown"
  output_path = "../common-bin/graphql/teardown/teardown-lambda.zip"

  depends_on = ["null_resource.integration_test_data_teardown_lambda_provisioner"]
}

resource "null_resource" "integration_test_data_teardown_lambda_provisioner" {
  provisioner "local-exec" {
    working_dir = "../common-bin/graphql/teardown"
    command     = "yarn install"
  }
}

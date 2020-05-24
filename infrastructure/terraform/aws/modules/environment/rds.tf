resource "aws_db_instance" "postgres" {
  identifier                          = "mxfactorial-postgres-${var.environment}"
  snapshot_identifier                 = var.db_snapshot_id
  allocated_storage                   = 20
  storage_type                        = "gp2"
  engine                              = "postgres"
  engine_version                      = "11.5"
  instance_class                      = "db.t2.micro"
  name                                = "mxfactorial"
  username                            = "u${random_password.pguser.result}"
  password                            = random_password.pgpassword.result
  port                                = 5432
  parameter_group_name                = "default.postgres11"
  backup_retention_period             = 0
  backup_window                       = "07:09-07:39"
  db_subnet_group_name                = aws_db_subnet_group.default.name
  deletion_protection                 = false
  enabled_cloudwatch_logs_exports     = ["postgresql", "upgrade"]
  iam_database_authentication_enabled = true
  skip_final_snapshot                 = true
  vpc_security_group_ids              = [aws_security_group.postgres.id]
  publicly_accessible                 = true
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
    PGDATABASE = aws_db_instance.postgres.name
    PGHOST     = aws_db_instance.postgres.address
    PGPASSWORD = aws_db_instance.postgres.password
    PGPORT     = aws_db_instance.postgres.port
    PGUSER     = aws_db_instance.postgres.username
  }
}

########## Create security group for RDS ##########
resource "aws_security_group" "postgres" {
  name        = "db-sec-grp-${var.environment}"
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
#   name                        = "rds-connect-${var.environment}"
#   description                 = "connecting to rds"
#   automatic_stop_time_minutes = 15
#   # assign ANY 1 subnet assigned in aws_db_subnet_group.default.subnet_ids, e.g. 0
#   subnet_id = tolist(data.aws_subnet_ids.default.ids)[0]
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
  description = "postgres db subnet group in ${var.environment}"
  name        = "db-subnet-group-${var.environment}"
  subnet_ids  = data.aws_subnet_ids.default.ids

  tags = {
    Name = "postgres-db-subnet-group"
  }
}

###### Reference CIDR blocks instead of security groups ######
###### since cloud9 creates its own security group ######
# data "aws_subnet" "rds_cloud9" {
#   count = length(data.aws_subnet_ids.default.ids)
#   # id    = data.aws_subnet_ids.default[count.index].ids
#   id = tolist(data.aws_subnet_ids.default.ids)[count.index]
# }

data "aws_s3_bucket_object" "integration_test_data_teardown_lambda" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "teardown-src.zip"
}

###### Integration test data teardown lambda ######
resource "aws_lambda_function" "integration_test_data_teardown_lambda" {
  function_name     = "delete-faker-rds-transactions-lambda-${var.environment}"
  description       = "Integration test data teardown lambda in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.integration_test_data_teardown_lambda.bucket
  s3_key            = data.aws_s3_bucket_object.integration_test_data_teardown_lambda.key
  s3_object_version = data.aws_s3_bucket_object.integration_test_data_teardown_lambda.version_id
  handler           = "index.handler"
  runtime           = "nodejs10.x"
  timeout           = 30
  # imported from lambda.tf
  role = aws_iam_role.test_data_teardown_lambda_role.arn
  environment {
    variables = local.POSTGRES_VARS
  }
}

resource "aws_cloudwatch_log_group" "integration_test_data_teardown_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.integration_test_data_teardown_lambda.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "test_data_teardown_lambda_role" {
  name = "test-data-teardown-lambda-role-${var.environment}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# policy for lambda to create logs and access rds
resource "aws_iam_role_policy" "test_data_teardown_lambda_policy" {
  name = "test-data-teardown-lambda-policy-${var.environment}"
  role = aws_iam_role.test_data_teardown_lambda_role.id

  policy = data.aws_iam_policy_document.test_data_teardown_lambda.json
}

data "aws_iam_policy_document" "test_data_teardown_lambda" {
  statement {
    sid = "TestDataTeardownLambdaLoggingPolicy${title(var.environment)}"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "*",
    ]
  }

  statement {
    sid = "TestDataTeardownLambdaVpcAccessPolicy${title(var.environment)}"
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DeleteNetworkInterface",
      "ec2:DescribeNetworkInterfaces"
    ]
    resources = [
      "*", # todo: restrict
    ]
  }
}

resource "aws_iam_role_policy_attachment" "rds_access_for_test_data_teardown_lambda" {
  role       = aws_iam_role.test_data_teardown_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

resource "aws_rds_cluster" "default" {
  cluster_identifier      = "mxfactorial-${var.environment}"
  engine                  = "aurora"
  engine_mode             = "serverless"
  engine_version          = "5.6.10a"
  database_name           = "mxfactorial"
  master_username         = var.db_master_username
  master_password         = var.db_master_password
  port                    = "3306"
  backup_retention_period = 1
  preferred_backup_window = "08:00-10:00"
  skip_final_snapshot     = true
  apply_immediately       = true
  db_subnet_group_name    = aws_db_subnet_group.default.name

  vpc_security_group_ids = [aws_security_group.rds.id]

  scaling_configuration {
    auto_pause               = true
    max_capacity             = 256
    min_capacity             = 2
    seconds_until_auto_pause = 1200
  }
}

########## Create clou9 instance to access RDS ##########
resource "aws_cloud9_environment_ec2" "default" {
  instance_type               = "t2.micro"
  name                        = "rds-connect-${var.environment}"
  description                 = "connecting to rds"
  automatic_stop_time_minutes = 15
  # assign ANY 1 subnet assigned in aws_db_subnet_group.default.subnet_ids, e.g. 0
  subnet_id = tolist(data.aws_subnet_ids.default.ids)[0]
}

########## Create security group for RDS ##########
resource "aws_security_group" "rds" {
  name        = "db-security-group-${var.environment}"
  description = "Allow internal MySQL 3306 port access"
  vpc_id      = data.aws_vpc.default.id
}

########## Allow traffic on port 3306 between cloud9 and RDS ##########
resource "aws_security_group_rule" "allow_cloud9" {
  type              = "ingress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  cidr_blocks       = data.aws_subnet.rds_cloud9.*.cidr_block
  security_group_id = aws_security_group.rds.id
}

###### Allow all traffic within RDS and lambda group ######
resource "aws_security_group_rule" "allow_all_internal_inbound_rds" {
  type              = "ingress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  self              = true
  security_group_id = aws_security_group.rds.id
}

###### Allow all outbound within RDS and lambda group for messaging topics and queues ######
resource "aws_security_group_rule" "allow_all_outbound_rds" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  self              = true
  security_group_id = aws_security_group.rds.id
}

###### Cherry-pick subnets for RDS in future ######
resource "aws_db_subnet_group" "default" {
  description = "serverless db subnet group"
  name        = "db-subnet-group-${var.environment}"
  subnet_ids  = data.aws_subnet_ids.default.ids

  tags = {
    Name = "serverless-db-subnet-group"
  }
}

###### Reference CIDR blocks instead of security groups ######
###### since cloud9 creates its own security group ######
data "aws_subnet" "rds_cloud9" {
  count = length(data.aws_subnet_ids.default.ids)
  # id    = data.aws_subnet_ids.default[count.index].ids
  id = tolist(data.aws_subnet_ids.default.ids)[count.index]
}

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
  runtime           = "nodejs8.10"
  timeout           = 30
  # imported from lambda.tf
  role = aws_iam_role.test_data_teardown_lambda_role.arn
  vpc_config {
    subnet_ids = data.aws_subnet_ids.default.ids

    security_group_ids = [
      aws_security_group.rds.id,
      data.aws_security_group.default.id,
    ]
  }
  environment {
    variables = {
      HOST     = aws_rds_cluster.default.endpoint
      USER     = var.db_master_username
      PASSWORD = var.db_master_password
    }
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

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "rds_access_for_test_data_teardown_lambda" {
  role       = aws_iam_role.test_data_teardown_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

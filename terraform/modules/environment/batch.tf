########## Permissions for Batch ##########
data "aws_iam_policy_document" "liquibase_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "liquibase_job_definition_role" {
  description = "permits batch job rds access"
  name        = "${var.liquibase_job_definition_role_name}"

  assume_role_policy = "${data.aws_iam_policy_document.liquibase_assume_role_policy.json}"
}

resource "aws_iam_role_policy_attachment" "add_ecs_task_to_job" {
  role       = "${aws_iam_role.liquibase_job_definition_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole"
}

resource "aws_iam_role_policy_attachment" "add_rds_to_job" {
  role       = "${aws_iam_role.liquibase_job_definition_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSDataFullAccess"
}

########## Job Definition for Batch ##########
resource "aws_batch_job_definition" "liquibase" {
  name = "${var.aws_batch_job_definition_name}"
  type = "container"

  container_properties = <<CONTAINER_PROPERTIES
{
    "command": [],
    "image": "mxfactorial/liquibase-rds:1.0.0",
    "memory": 2048,
    "vcpus": 2,
    "jobRoleArn": "${aws_iam_role.liquibase_job_definition_role.arn}",
    "volumes": [],
    "environment": [],
    "mountPoints": [],
    "ulimits": []
}
CONTAINER_PROPERTIES
}

########## Compute Environment for Batch ##########

resource "aws_batch_job_queue" "default" {
  name                 = "${var.aws_batch_job_queue_name}"
  state                = "ENABLED"
  priority             = 100
  compute_environments = ["${aws_batch_compute_environment.default.arn}"]
}

########## Compute Environment for Batch ##########
resource "aws_iam_role" "batch_ecs_instance_role" {
  description = "permits compute environment to manage ecs"
  name        = "${var.batch_ecs_instance_role_name}"

  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
    {
        "Action": "sts:AssumeRole",
        "Effect": "Allow",
        "Principal": {
        "Service": "ec2.amazonaws.com"
        }
    }
    ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "batch_ecs_instance_role" {
  role       = "${aws_iam_role.batch_ecs_instance_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "batch_ecs_instance_role" {
  name = "${var.batch_aws_iam_instance_profile_name}"
  role = "${aws_iam_role.batch_ecs_instance_role.name}"
}

resource "aws_iam_role" "aws_batch_service_role" {
  description = "permits ecs to manage batch"
  name        = "${var.aws_batch_service_role_name}"

  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
    {
        "Action": "sts:AssumeRole",
        "Effect": "Allow",
        "Principal": {
        "Service": "batch.amazonaws.com"
        }
    }
    ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "aws_batch_service_role" {
  role       = "${aws_iam_role.aws_batch_service_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole"
}

resource "aws_batch_compute_environment" "default" {
  compute_environment_name = "${var.aws_batch_compute_environment_name}"

  compute_resources {
    instance_role = "${aws_iam_instance_profile.batch_ecs_instance_role.arn}"

    instance_type = [
      "optimal",
    ]

    max_vcpus     = 16
    min_vcpus     = 0
    desired_vcpus = 2

    security_group_ids = ["${data.aws_security_group.default.id}"]

    subnets = ["${data.aws_subnet_ids.default.ids}"]

    type = "EC2"

    tags {
      name = "${var.aws_batch_compute_environment_name}"
    }
  }

  service_role = "${aws_iam_role.aws_batch_service_role.arn}"
  type         = "MANAGED"
  depends_on   = ["aws_iam_role_policy_attachment.aws_batch_service_role"]

  state = "ENABLED"
}

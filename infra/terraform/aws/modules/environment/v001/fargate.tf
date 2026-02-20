locals {
  build_fargate = var.ecs_instance_size != ""
  ecs_cpu = local.build_fargate ? split("/", var.ecs_instance_size)[0] : "256"
  ecs_memory = local.build_fargate ? split("/", var.ecs_instance_size)[1] : "512"

  EVENT_CONF   = local.PROJECT_CONF.services.event
  MEASURE_CONF = local.PROJECT_CONF.services.measure
  MEASURE_PORT = local.MEASURE_CONF.env_var.set.MEASURE_PORT.default
}

data "aws_ecr_repository" "event" {
  count = local.build_fargate ? 1 : 0
  name  = "${var.env_id}/${var.env}/event"
}

data "aws_ecr_repository" "measure" {
  count = local.build_fargate ? 1 : 0
  name  = "${var.env_id}/${var.env}/measure"
}

########## iam ##########

resource "aws_iam_role" "ecs_task_execution" {
  count = local.build_fargate ? 1 : 0
  name  = "ecs-task-execution-${local.ID_ENV}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  count      = local.build_fargate ? 1 : 0
  role       = aws_iam_role.ecs_task_execution[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_policy" "ecs_service_connect" {
  count = local.build_fargate ? 1 : 0
  name  = "ecs-service-connect-${local.ID_ENV}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "servicediscovery:RegisterInstance",
        "servicediscovery:DeregisterInstance",
        "servicediscovery:DiscoverInstances",
        "servicediscovery:GetNamespace",
        "servicediscovery:GetService",
        "servicediscovery:ListInstances"
      ]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_service_connect" {
  count      = local.build_fargate ? 1 : 0
  role       = aws_iam_role.ecs_task_execution[0].name
  policy_arn = aws_iam_policy.ecs_service_connect[0].arn
}

resource "aws_iam_role" "ecs_task" {
  count = local.build_fargate ? 1 : 0
  name  = "ecs-task-${local.ID_ENV}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_sqs" {
  count      = local.build_fargate ? 1 : 0
  role       = aws_iam_role.ecs_task[0].name
  policy_arn = aws_iam_policy.auto_transact_sqs.arn
}

resource "aws_iam_role_policy_attachment" "ecs_task_sns" {
  count      = local.build_fargate ? 1 : 0
  role       = aws_iam_role.ecs_task[0].name
  policy_arn = aws_iam_policy.gdp_sns_publish.arn
}

resource "aws_iam_role_policy_attachment" "ecs_task_dynamodb" {
  count      = local.build_fargate ? 1 : 0
  role       = aws_iam_role.ecs_task[0].name
  policy_arn = aws_iam_policy.warm_cache_dynamodb.arn
}

########## security group ##########

resource "aws_security_group" "ecs" {
  count       = local.build_fargate ? 1 : 0
  name        = "ecs-${local.ID_ENV}"
  description = "ecs fargate tasks"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "measure websocket"
    from_port   = local.MEASURE_PORT
    to_port     = local.MEASURE_PORT
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

########## cluster ##########

resource "aws_ecs_cluster" "default" {
  count = local.build_fargate ? 1 : 0
  name  = "${local.ID_ENV}"
}

########## cloudwatch log groups ##########

resource "aws_cloudwatch_log_group" "event" {
  count             = local.build_fargate ? 1 : 0
  name              = "/ecs/event-${local.ID_ENV}"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "measure" {
  count             = local.build_fargate ? 1 : 0
  name              = "/ecs/measure-${local.ID_ENV}"
  retention_in_days = 7
}

########## event task ##########

resource "aws_ecs_task_definition" "event" {
  count                    = local.build_fargate ? 1 : 0
  family                   = "event-${local.ID_ENV}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = local.ecs_cpu
  memory                   = local.ecs_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution[0].arn
  task_role_arn            = aws_iam_role.ecs_task[0].arn

  container_definitions = jsonencode([{
    name  = "event"
    image = "${data.aws_ecr_repository.event[0].repository_url}:init"
    essential = true
    environment = [
      for k, v in merge(local.POSTGRES_VARS, {
        RUST_LOG              = "info"
        TRANSACTION_DDB_TABLE = aws_dynamodb_table.cache.name
        CACHE_TABLE_HASH_KEY  = local.CACHE_TABLE_HASH_KEY
        CACHE_TABLE_RANGE_KEY = local.CACHE_TABLE_RANGE_KEY
        SQS_QUEUE_URL         = aws_sqs_queue.auto_transact.url
        SNS_TOPIC_ARN         = aws_sns_topic.gdp.arn
      }) : { name = k, value = tostring(v) }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.event[0].name
        "awslogs-region"        = data.aws_region.current.id
        "awslogs-stream-prefix" = "event"
      }
    }
  }])

  lifecycle {
    ignore_changes = [container_definitions]
  }
}

resource "aws_ecs_service" "event" {
  count           = local.build_fargate ? 1 : 0
  name            = "event-${local.ID_ENV}"
  cluster         = aws_ecs_cluster.default[0].id
  task_definition = aws_ecs_task_definition.event[0].arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs[0].id]
    assign_public_ip = true
  }
}

########## measure task ##########

resource "aws_ecs_task_definition" "measure" {
  count                    = local.build_fargate ? 1 : 0
  family                   = "measure-${local.ID_ENV}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = local.ecs_cpu
  memory                   = local.ecs_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution[0].arn
  task_role_arn            = aws_iam_role.ecs_task[0].arn

  container_definitions = jsonencode([{
    name  = "measure"
    image = "${data.aws_ecr_repository.measure[0].repository_url}:init"
    essential = true
    portMappings = [{
      name          = "measure"
      containerPort = local.MEASURE_PORT
      protocol      = "tcp"
    }]
    environment = [
      for k, v in merge(local.POSTGRES_VARS, {
        RUST_LOG              = "info"
        MEASURE_PORT          = tostring(local.MEASURE_PORT)
        READINESS_CHECK_PATH  = var.readiness_check_path
        SNS_TOPIC_ARN         = aws_sns_topic.gdp.arn
        TRANSACTION_DDB_TABLE = aws_dynamodb_table.cache.name
        CACHE_TABLE_HASH_KEY  = local.CACHE_TABLE_HASH_KEY
        CACHE_TABLE_RANGE_KEY = local.CACHE_TABLE_RANGE_KEY
      }) : { name = k, value = tostring(v) }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.measure[0].name
        "awslogs-region"        = data.aws_region.current.id
        "awslogs-stream-prefix" = "measure"
      }
    }
  }])

  lifecycle {
    ignore_changes = [container_definitions]
  }
}

########## service discovery ##########

resource "aws_service_discovery_http_namespace" "default" {
  count = local.build_fargate ? 1 : 0
  name  = local.ID_ENV
}

resource "aws_ecs_service" "measure" {
  count           = local.build_fargate ? 1 : 0
  name            = "measure-${local.ID_ENV}"
  cluster         = aws_ecs_cluster.default[0].id
  task_definition = aws_ecs_task_definition.measure[0].arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs[0].id]
    assign_public_ip = true
  }

  service_registries {
    registry_arn = aws_service_discovery_service.measure[0].arn
  }
}

resource "aws_service_discovery_service" "measure" {
  count = local.build_fargate ? 1 : 0
  name  = "measure"
  namespace_id = aws_service_discovery_http_namespace.default[0].id
}

########## api gateway for measure websocket ##########

resource "aws_apigatewayv2_api" "measure" {
  count         = local.build_fargate ? 1 : 0
  name          = "measure-${local.ID_ENV}"
  protocol_type = "HTTP"
}

data "aws_availability_zones" "apigw" {
  count = local.build_fargate ? 1 : 0
  state = "available"
  exclude_zone_ids = var.apigw_excluded_az_ids
}

data "aws_subnets" "apigw" {
  count = local.build_fargate ? 1 : 0
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
  filter {
    name   = "availability-zone"
    values = data.aws_availability_zones.apigw[0].names
  }
}

resource "aws_apigatewayv2_vpc_link" "measure" {
  count              = local.build_fargate ? 1 : 0
  name               = "measure-${local.ID_ENV}"
  subnet_ids         = data.aws_subnets.apigw[0].ids
  security_group_ids = [aws_security_group.ecs[0].id]
}

resource "aws_apigatewayv2_integration" "measure" {
  count              = local.build_fargate ? 1 : 0
  api_id             = aws_apigatewayv2_api.measure[0].id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.measure[0].id
  integration_uri    = aws_service_discovery_service.measure[0].arn
}

resource "aws_apigatewayv2_route" "measure" {
  count     = local.build_fargate ? 1 : 0
  api_id    = aws_apigatewayv2_api.measure[0].id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.measure[0].id}"
}

resource "aws_apigatewayv2_stage" "measure" {
  count       = local.build_fargate ? 1 : 0
  api_id      = aws_apigatewayv2_api.measure[0].id
  name        = "$default"
  auto_deploy = true
}

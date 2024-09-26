resource "aws_instance" "default" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.default.key_name
  vpc_security_group_ids = [aws_security_group.default.id]
  # provision in the same subnet as rds postgres
  subnet_id = tolist(data.aws_db_subnet_group.default.subnet_ids)[0]
  user_data = file("${path.module}/user-data.sh")
  tags = {
    Name = "${local.NAME}-${local.ID_ENV}"
  }
}

# passed around in the state file, demo only
resource "tls_private_key" "default" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "default" {
  key_name   = "${local.MICROK8S_SSH_KEY_NAME_PREFIX}-${local.ID_ENV}"
  public_key = sensitive(tls_private_key.default.public_key_openssh)
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# permissive for demo
resource "aws_security_group" "default" {
  name        = "${local.NAME}-sec-grp-${local.ID_ENV}"
  description = "${local.NAME} access in ${local.SPACED_ID_ENV}"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "ssh"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "microk8s"
    from_port   = 16443
    to_port     = 16443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "measure node port"
    from_port   = 30010
    to_port     = 30010
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_db_subnet_group" "default" {
  # todo: replace hardcoded "db-subnet-group" prefix with variable here and
  # in infrastructure/terraform/aws/modules/environment/v001/rds.tf
  name = "db-subnet-group-${local.ID_ENV}"
}

data "aws_vpc" "default" {
  default = true
}

module "batch" {
  source                              = "../modules/batch"
  batch_ecs_instance_role_name        = "batch-ecs-instance-role-${terraform.workspace}"
  batch_aws_iam_instance_profile_name = "batch-aws-iam-instance-profile-${terraform.workspace}"
  aws_batch_service_role_name         = "aws-batch-service-role-${terraform.workspace}"
  aws_batch_compute_environment_name  = "batch-compute-environment-${terraform.workspace}"
  liquibase_job_definition_role_name  = "liquibase-job-definition-role-${terraform.workspace}"
}

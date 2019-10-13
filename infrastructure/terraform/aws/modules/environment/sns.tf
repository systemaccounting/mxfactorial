resource "aws_sns_topic" "notifications" {
  name = "notifications-${var.environment}"
}

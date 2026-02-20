resource "aws_sqs_queue" "auto_transact" {
  name = "auto-transact-${local.ID_ENV}"
}

resource "aws_iam_policy" "auto_transact_sqs" {
  name = "auto-transact-sqs-${local.ID_ENV}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["sqs:SendMessage", "sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
      Resource = aws_sqs_queue.auto_transact.arn
    }]
  })
}

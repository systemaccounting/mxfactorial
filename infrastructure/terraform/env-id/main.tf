resource "random_id" "env_id" {
  byte_length = 2
}

output "env_id" {
  value = random_id.env_id.dec
}
